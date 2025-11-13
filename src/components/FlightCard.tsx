import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, Calendar, Users } from "lucide-react";

interface FlightCardProps {
  flight: any;
  onBook: () => void;
}

const FlightCard = ({ flight, onBook }: FlightCardProps) => {
  const route = flight.routes;
  const aircraft = flight.aircraft;
  const origin = route?.origin_airport;
  const destination = route?.destination_airport;

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
      <div className="h-2 bg-gradient-to-r from-sky via-ocean to-navy" />
      <CardContent className="p-6 space-y-4">
        {/* Flight Number & Status */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Plane className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold text-foreground">{flight.flight_no}</span>
            </div>
            <p className="text-sm text-muted-foreground">{aircraft?.model}</p>
          </div>
          <Badge variant={flight.status === "Scheduled" ? "default" : "secondary"}>
            {flight.status}
          </Badge>
        </div>

        {/* Route */}
        <div className="flex items-center justify-between py-4 border-y">
          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-foreground">{origin?.iata_code}</p>
            <p className="text-sm text-muted-foreground">{origin?.city}</p>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-[100px]">
              <div className="border-t-2 border-primary/30 absolute top-1/2 w-full" />
              <Plane className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 bg-background" />
            </div>
          </div>
          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-foreground">{destination?.iata_code}</p>
            <p className="text-sm text-muted-foreground">{destination?.city}</p>
          </div>
        </div>

        {/* Flight Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(flight.flight_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(flight.departure_time)} - {formatTime(flight.arrival_time)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{flight.available_seats} seats available</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="text-2xl font-bold text-primary">${flight.base_fare}</p>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <Button onClick={onBook} className="w-full" disabled={flight.available_seats === 0}>
          {flight.available_seats === 0 ? "Sold Out" : "Book Now"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FlightCard;
