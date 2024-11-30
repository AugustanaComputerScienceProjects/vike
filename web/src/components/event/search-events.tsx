import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import firebase from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

const SearchEvents = ({ calendarId, onEventAdd }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState([]);
  const [addedEvents, setAddedEvents] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch all available events
        const eventsRef = firebase.database.ref("/current-events");
        const eventsSnapshot = await eventsRef.once("value");
        const eventsData = eventsSnapshot.val() || {};
        
        // Fetch calendar's existing events to filter them out
        const calendarRef = firebase.database.ref(`/calendars/${calendarId}`);
        const calendarSnapshot = await calendarRef.once("value");
        const calendarData = calendarSnapshot.val();
        const existingEvents = calendarData?.eventsCalendar || {};

        // Filter out events that are already in the calendar
        const availableEvents = Object.entries(eventsData)
          .filter(([id]) => !existingEvents[id])
          .map(([id, data]) => ({
            id,
            ...(data as Record<string, unknown>),
          }));

        setEvents(availableEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description: "Failed to load available events",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [calendarId, toast]);

  const handleAddEvent = async (event) => {
    try {
      const ref = firebase.database.ref(`/calendars/${calendarId}/eventsCalendar/${event.id}`);
      await ref.set(event);
      setAddedEvents((prev) => ({ ...prev, [event.id]: true }));
      toast({
        title: "Success",
        description: "Event added to calendar",
      });
      onEventAdd?.();
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events.filter((event) =>
    event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Search Available Events</h2>
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center">Loading events...</div>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{event.name}</CardTitle>
                      <CardDescription>
                        {format(new Date(event.startDate), "PPP")} at{" "}
                        {format(new Date(event.startDate), "p")}
                      </CardDescription>
                    </div>
                    <Button
                      variant={addedEvents[event.id] ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleAddEvent(event)}
                      disabled={addedEvents[event.id]}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {addedEvents[event.id] ? "Added" : "Add"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  {event.location && (
                    <p className="text-sm text-muted-foreground mt-2">
                      📍 {event.location}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground">
              {searchTerm
                ? "No events found matching your search"
                : "No available events found"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchEvents; 