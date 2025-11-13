-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'passenger');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  passport_no TEXT,
  nationality TEXT,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create airports table
CREATE TABLE public.airports (
  iata_code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  timezone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.airports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view airports"
  ON public.airports FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage airports"
  ON public.airports FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create aircraft table
CREATE TABLE public.aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model TEXT NOT NULL,
  total_seats INTEGER NOT NULL,
  seat_map JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view aircraft"
  ON public.aircraft FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage aircraft"
  ON public.aircraft FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create routes table
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT REFERENCES public.airports(iata_code) NOT NULL,
  destination TEXT REFERENCES public.airports(iata_code) NOT NULL,
  distance_km INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view routes"
  ON public.routes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage routes"
  ON public.routes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create flights table
CREATE TABLE public.flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_no TEXT NOT NULL,
  aircraft_id UUID REFERENCES public.aircraft(id) NOT NULL,
  route_id UUID REFERENCES public.routes(id) NOT NULL,
  flight_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  base_fare NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Delayed', 'Cancelled', 'Completed')),
  available_seats INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view flights"
  ON public.flights FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage flights"
  ON public.flights FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pnr TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flight_id UUID REFERENCES public.flights(id) NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_email TEXT NOT NULL,
  passenger_phone TEXT,
  seat_number TEXT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  booking_status TEXT DEFAULT 'Confirmed' CHECK (booking_status IN ('Confirmed', 'Cancelled', 'Completed')),
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed', 'Failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to generate PNR
CREATE OR REPLACE FUNCTION public.generate_pnr()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Trigger to auto-generate PNR
CREATE OR REPLACE FUNCTION public.set_pnr()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.pnr IS NULL OR NEW.pnr = '' THEN
    NEW.pnr := public.generate_pnr();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_set_pnr
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_pnr();

-- Trigger to update available seats after booking
CREATE OR REPLACE FUNCTION public.update_available_seats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.booking_status = 'Confirmed' THEN
    UPDATE public.flights
    SET available_seats = available_seats - 1
    WHERE id = NEW.flight_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.booking_status = 'Confirmed' AND NEW.booking_status = 'Cancelled' THEN
    UPDATE public.flights
    SET available_seats = available_seats + 1
    WHERE id = NEW.flight_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_update_seats
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_available_seats();

-- Function to handle new user and create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  -- Assign role based on metadata
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'passenger'::app_role)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample airports
INSERT INTO public.airports (iata_code, name, city, country, timezone) VALUES
('DEL', 'Indira Gandhi International Airport', 'New Delhi', 'India', 'Asia/Kolkata'),
('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India', 'Asia/Kolkata'),
('BLR', 'Kempegowda International Airport', 'Bangalore', 'India', 'Asia/Kolkata'),
('DXB', 'Dubai International Airport', 'Dubai', 'UAE', 'Asia/Dubai'),
('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore', 'Asia/Singapore'),
('LHR', 'Heathrow Airport', 'London', 'United Kingdom', 'Europe/London'),
('JFK', 'John F. Kennedy International Airport', 'New York', 'USA', 'America/New_York'),
('LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA', 'America/Los_Angeles');

-- Insert sample aircraft
INSERT INTO public.aircraft (model, total_seats, seat_map) VALUES
('Airbus A320', 180, '{"layout": "3-3", "rows": 30}'),
('Boeing 737', 160, '{"layout": "3-3", "rows": 27}'),
('Boeing 777', 350, '{"layout": "3-4-3", "rows": 35}'),
('Airbus A380', 550, '{"layout": "3-4-3", "rows": 55}');

-- Insert sample routes
INSERT INTO public.routes (origin, destination, distance_km) VALUES
('DEL', 'BOM', 1137),
('BOM', 'BLR', 840),
('DEL', 'DXB', 2196),
('BOM', 'DXB', 1924),
('DEL', 'SIN', 4137),
('BOM', 'LHR', 7196),
('DEL', 'JFK', 11740),
('LAX', 'JFK', 3944);

-- Insert sample flights
INSERT INTO public.flights (flight_no, aircraft_id, route_id, flight_date, departure_time, arrival_time, base_fare, available_seats)
SELECT 
  'AI' || LPAD((ROW_NUMBER() OVER())::TEXT, 3, '0'),
  (SELECT id FROM public.aircraft ORDER BY random() LIMIT 1),
  r.id,
  CURRENT_DATE + (INTERVAL '1 day' * (ROW_NUMBER() OVER() % 30)),
  ('08:00:00'::TIME + (INTERVAL '2 hours' * (ROW_NUMBER() OVER() % 6))),
  ('10:00:00'::TIME + (INTERVAL '2 hours' * (ROW_NUMBER() OVER() % 6))),
  5000 + (random() * 10000)::NUMERIC(10,2),
  (SELECT total_seats FROM public.aircraft WHERE id = (SELECT id FROM public.aircraft ORDER BY random() LIMIT 1))
FROM public.routes r
LIMIT 20;