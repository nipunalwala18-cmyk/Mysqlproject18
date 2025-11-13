import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plane, Search, Calendar, MapPin, LogOut, User } from "lucide-react";
import FlightSearch from "@/components/FlightSearch";
import FlightCard from "@/components/FlightCard";
import { toast } from "sonner";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchFlights();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await fetchUserRole(user.id);
    }
    setLoading(false);
  };

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (data) {
      setUserRole(data.role);
    }
  };

  const fetchFlights = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from("flights")
      .select(`
        *,
        routes!inner(*, 
          origin_airport:airports!routes_origin_fkey(iata_code, city, country),
          destination_airport:airports!routes_destination_fkey(iata_code, city, country)
        ),
        aircraft(model, total_seats)
      `)
      .gte("flight_date", today)
      .eq("status", "Scheduled")
      .order("flight_date", { ascending: true })
      .limit(8);

    if (data) {
      setFlights(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Plane className="h-12 w-12 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-background via-sky/10 to-ocean/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTQ2aDEydjEySDE2em0yNCAwaDEydjEySDQwem0yNCAwaDEydjEySDY0em0xMiAwaDEydjEySDg4em0xMiAwaDEydjEySDExMnptMjQgMGgxMnYxMmgxNnptMjQgMGgxMnYxMmgtMTZ6TTAgMTU4aDEydjEySDB6bTI0IDBoMTJ2MTJIMjR6bTI0IDBoMTJ2MTJINDh6bTI0IDBoMTJ2MTJINzJ6bTI0IDBoMTJ2MTJIOTZ6bTI0IDBoMTJ2MTJoLTEyem0yNCAwaDEydjEyaC0xMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
          
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-gradient-to-br from-sky to-ocean">
                  <Plane className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-ocean to-sky bg-clip-text text-transparent">
                  SkyWings
                </span>
              </div>
              <Button onClick={() => navigate("/auth")} variant="outline">
                Sign In
              </Button>
            </div>

            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-navy via-ocean to-sky bg-clip-text text-transparent leading-tight">
                Your Journey Begins Here
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience world-class service, competitive fares, and seamless travel with SkyWings Airlines
              </p>
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6">
                Start Booking
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Flights */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Routes</h2>
            <p className="text-muted-foreground">Discover our most traveled destinations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {flights.slice(0, 6).map((flight) => (
              <FlightCard key={flight.id} flight={flight} onBook={() => navigate("/auth")} />
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              View All Flights
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-br from-sky to-ocean">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-ocean to-sky bg-clip-text text-transparent">
                SkyWings
              </span>
            </div>
            <div className="flex items-center gap-4">
              {userRole === "admin" && (
                <Button onClick={() => navigate("/admin")} variant="outline">
                  Admin Dashboard
                </Button>
              )}
              {userRole === "passenger" && (
                <Button onClick={() => navigate("/bookings")} variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  My Bookings
                </Button>
              )}
              <Button onClick={handleSignOut} variant="ghost" size="icon">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-navy via-ocean to-sky bg-clip-text text-transparent">
            Where would you like to fly?
          </h1>
          <FlightSearch onSearch={setFlights} />
        </div>
      </div>

      {/* Flights Grid */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">Available Flights</h2>
        {flights.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No flights found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onBook={() => navigate(`/book/${flight.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
