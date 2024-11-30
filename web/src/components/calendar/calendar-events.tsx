import AddEvent from "@/components/event/add-event";
import EventCard from "@/components/event/event-card";
import SearchEvents from "@/components/event/search-events";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Event } from "@/firebase/types";
import useCalendarEvents from "@/hooks/use-calendar-events";
import { format } from "date-fns";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { groupEventsByDate } from "./utils";

const CalendarEvents = ({ calendarId }) => {
  const { events, loading, refreshEvents } = useCalendarEvents(calendarId);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const renderEventSection = (date: string, events: Event[]) => {
    const eventDate = new Date(date);
    return (
      <div key={date} className="relative">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex flex-col px-6 py-4">
            <span className="text-xl font-semibold">
              {format(eventDate, "MMMM d, yyyy")}
            </span>
            <span className="text-sm text-muted-foreground">
              {format(eventDate, "EEEE")}
            </span>
          </div>
        </div>
        <div className="divide-y">
          {events.map((event) => (
            <div key={event.id} className="px-6 py-4">
              <EventCard 
                event={event}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <AddEvent 
              calendarId={calendarId}
              onSuccess={() => {
                setIsAddEventOpen(false);
                refreshEvents();
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search Events
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <SearchEvents 
              calendarId={calendarId}
              onEventAdd={() => {
                setIsSearchOpen(false);
                refreshEvents();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <ScrollArea className="h-[700px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="divide-y">
              {Object.entries(groupEventsByDate(events))
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([date, events]) => renderEventSection(date, events))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No events found</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default CalendarEvents; 