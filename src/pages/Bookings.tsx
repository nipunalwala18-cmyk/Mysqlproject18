import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Calendar, Clock, MapPin, ArrowLeft, XCircle } from "lucide-react";
import { toast } from "sonner";

const Bookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        flights!inner(
          *,
          routes!inner(
            *,
            origin_airport:airports!routes_origin_fkey(iata_code, city, country),
            destination_airport:airports!routes_destination_fkey(iata_code, city, country)
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setBookings(data);
    }
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    const { error } = await supabase
      .from("bookings")
      .update({ booking_status: "Cancelled" })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to cancel booking");
    } else {
      toast.success("Booking cancelled successfully");
      fetchBookings();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Plane className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button onClick={() => navigate("/")} variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-navy via-ocean to-sky bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-muted-foreground mt-2">Manage your flight reservations</p>
        </div>

        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No bookings yet</p>
              <Button onClick={() => navigate("/")}>Search Flights</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const flight = booking.flights;
              const route = flight.routes;
              const origin = route.origin_airport;
              const destination = route.destination_airport;

              return (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-sky via-ocean to-navy" />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">PNR: {booking.pnr}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Booked on {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            booking.booking_status === "Confirmed"
                              ? "default"
                              : booking.booking_status === "Cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {booking.booking_status}
                        </Badge>
                        <Badge variant="outline">{booking.payment_status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Flight Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Plane className="h-4 w-4 text-primary" />
                          Flight Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Flight:</span>
                            <span className="font-semibold">{flight.flight_no}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Seat:</span>
                            <span className="font-semibold">{booking.seat_number}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-semibold">
                              {new Date(flight.flight_date).toLocaleDateString()}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-semibold">
                              {flight.departure_time.slice(0, 5)} - {flight.arrival_time.slice(0, 5)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          Route
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">From</p>
                            <p className="font-semibold">
                              {origin.city} ({origin.iata_code})
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">To</p>
                            <p className="font-semibold">
                              {destination.city} ({destination.iata_code})
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Passenger Details */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Passenger Information</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-semibold">{booking.passenger_name}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-semibold">{booking.passenger_email}</span>
                        </p>
                        {booking.passenger_phone && (
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Phone:</span>
                            <span className="font-semibold">{booking.passenger_phone}</span>
                          </p>
                        )}
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-bold text-primary text-lg">
                            ${booking.total_amount}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.booking_status === "Confirmed" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Booking
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
