import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plane } from "lucide-react";
import { toast } from "sonner";

const BookFlight = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  
  const [passengerName, setPassengerName] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [seatNumber, setSeatNumber] = useState("");

  useEffect(() => {
    checkUser();
    fetchFlight();
  }, [flightId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);

    // Fetch profile to pre-fill form
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setPassengerName(profile.full_name || "");
      setPassengerPhone(profile.phone || "");
    }
    setPassengerEmail(user.email || "");
  };

  const fetchFlight = async () => {
    const { data, error } = await supabase
      .from("flights")
      .select(`
        *,
        routes!inner(
          *,
          origin_airport:airports!routes_origin_fkey(iata_code, city, country),
          destination_airport:airports!routes_destination_fkey(iata_code, city, country)
        ),
        aircraft(model, total_seats)
      `)
      .eq("id", flightId)
      .single();

    if (data) {
      setFlight(data);
    }
    setLoading(false);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !flight) return;

    if (flight.available_seats <= 0) {
      toast.error("No seats available");
      return;
    }

    setBooking(true);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([{
          user_id: user.id,
          flight_id: flight.id,
          passenger_name: passengerName,
          passenger_email: passengerEmail,
          passenger_phone: passengerPhone,
          seat_number: seatNumber || `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
          total_amount: flight.base_fare,
          booking_status: "Confirmed",
          payment_status: "Completed",
          pnr: "",
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Booking confirmed! Redirecting...");
      setTimeout(() => navigate("/bookings"), 1500);
    } catch (error: any) {
      toast.error("Booking failed: " + error.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Plane className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <p className="text-lg mb-4">Flight not found</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  const route = flight.routes;
  const origin = route.origin_airport;
  const destination = route.destination_airport;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4">
        <Button onClick={() => navigate("/")} variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Flight Details */}
          <Card>
            <div className="h-2 bg-gradient-to-r from-sky via-ocean to-navy" />
            <CardHeader>
              <CardTitle className="text-2xl">Flight Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Flight Number</p>
                <p className="text-2xl font-bold">{flight.flight_no}</p>
              </div>

              <div className="flex items-center justify-between py-4 border-y">
                <div>
                  <p className="text-2xl font-bold">{origin.iata_code}</p>
                  <p className="text-sm text-muted-foreground">{origin.city}</p>
                </div>
                <Plane className="h-6 w-6 text-primary rotate-90" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{destination.iata_code}</p>
                  <p className="text-sm text-muted-foreground">{destination.city}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-semibold">{new Date(flight.flight_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-semibold">
                    {flight.departure_time.slice(0, 5)} - {flight.arrival_time.slice(0, 5)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Aircraft</p>
                  <p className="font-semibold">{flight.aircraft.model}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Available Seats</p>
                  <p className="font-semibold">{flight.available_seats}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Total Fare</p>
                <p className="text-4xl font-bold text-primary">${flight.base_fare}</p>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Passenger Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={passengerEmail}
                    onChange={(e) => setPassengerEmail(e.target.value)}
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seat">Preferred Seat (Optional)</Label>
                  <Input
                    id="seat"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    placeholder="e.g., 12A"
                    maxLength={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank for automatic seat assignment
                  </p>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Payment Summary</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">${flight.base_fare}</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={booking}>
                    {booking ? "Processing..." : "Confirm Booking"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By confirming, you agree to our terms and conditions
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookFlight;
