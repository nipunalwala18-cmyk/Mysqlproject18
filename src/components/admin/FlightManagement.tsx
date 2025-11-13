import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const FlightManagement = () => {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    const { data, error } = await supabase
      .from("flights")
      .select(`
        *,
        routes!inner(
          *,
          origin_airport:airports!routes_origin_fkey(iata_code, city),
          destination_airport:airports!routes_destination_fkey(iata_code, city)
        ),
        aircraft(model)
      `)
      .order("flight_date", { ascending: true });

    if (data) {
      setFlights(data);
    }
    setLoading(false);
  };

  const handleDeleteFlight = async (flightId: string) => {
    if (!confirm("Are you sure you want to delete this flight?")) return;

    const { error } = await supabase.from("flights").delete().eq("id", flightId);

    if (error) {
      toast.error("Failed to delete flight");
    } else {
      toast.success("Flight deleted successfully");
      fetchFlights();
    }
  };

  const updateFlightStatus = async (flightId: string, status: string) => {
    const { error } = await supabase
      .from("flights")
      .update({ status })
      .eq("id", flightId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated successfully");
      fetchFlights();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Flight Management</CardTitle>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Flight
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight No</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Aircraft</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flights.map((flight) => {
                const route = flight.routes;
                return (
                  <TableRow key={flight.id}>
                    <TableCell className="font-medium">{flight.flight_no}</TableCell>
                    <TableCell>
                      {route.origin_airport.iata_code} → {route.destination_airport.iata_code}
                    </TableCell>
                    <TableCell>{new Date(flight.flight_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {flight.departure_time.slice(0, 5)} - {flight.arrival_time.slice(0, 5)}
                    </TableCell>
                    <TableCell>{flight.aircraft.model}</TableCell>
                    <TableCell>{flight.available_seats}</TableCell>
                    <TableCell>${flight.base_fare}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          flight.status === "Scheduled"
                            ? "default"
                            : flight.status === "Cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {flight.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteFlight(flight.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightManagement;
