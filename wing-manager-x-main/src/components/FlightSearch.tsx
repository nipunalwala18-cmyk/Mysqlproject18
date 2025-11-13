import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";

interface FlightSearchProps {
  onSearch: (flights: any[]) => void;
}

const FlightSearch = ({ onSearch }: FlightSearchProps) => {
  const [airports, setAirports] = useState<any[]>([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = async () => {
    const { data, error } = await supabase
      .from("airports")
      .select("*")
      .order("city");

    if (data) {
      setAirports(data);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let query = supabase
        .from("flights")
        .select(`
          *,
          routes!inner(*, 
            origin_airport:airports!routes_origin_fkey(iata_code, city, country),
            destination_airport:airports!routes_destination_fkey(iata_code, city, country)
          ),
          aircraft(model, total_seats)
        `)
        .eq("status", "Scheduled")
        .gt("available_seats", 0);

      if (origin) {
        query = query.eq("routes.origin", origin);
      }
      if (destination) {
        query = query.eq("routes.destination", destination);
      }
      if (date) {
        query = query.eq("flight_date", date);
      }

      const { data, error } = await query.order("flight_date");

      if (error) throw error;

      onSearch(data || []);
      toast.success(`Found ${data?.length || 0} flights`);
    } catch (error: any) {
      toast.error("Search failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-lg">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              From
            </Label>
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger id="origin">
                <SelectValue placeholder="Select origin" />
              </SelectTrigger>
              <SelectContent>
                {airports.map((airport) => (
                  <SelectItem key={airport.iata_code} value={airport.iata_code}>
                    {airport.city} ({airport.iata_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              To
            </Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger id="destination">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {airports.map((airport) => (
                  <SelectItem key={airport.iata_code} value={airport.iata_code}>
                    {airport.city} ({airport.iata_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Search Flights"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOrigin("");
              setDestination("");
              setDate("");
            }}
          >
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default FlightSearch;
