"use client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useState } from "react";

import AddEvent from "@/components/event/add-event";
import EventCard from "@/components/event/event-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import useEvents from "@/hooks/use-events";

const Events = () => {
  const { user } = useAuth();
  const { currentEvents, pastEvents, loading } = useEvents(user?.email || "");
  const [showPastEvents, setShowPastEvents] = useState(false);

  const groupEventsByDate = (events) => {
    const groupedEvents = {};
    events.forEach((event) => {
      const eventDate = new Date(event.startDate);
      const dateKey = format(eventDate, "yyyy-MM-dd");
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });
    return groupedEvents;
  };

  const renderEventSection = (date, events) => {
    const eventDate = new Date(date);
    eventDate.setMinutes(
      eventDate.getMinutes() + eventDate.getTimezoneOffset()
    );
    return (
      <div className="flex " key={date}>
        <div className="w-1/4">
          <h6 className="text-lg">{format(eventDate, "MMM d")}</h6>
          <p className="text-base">{format(eventDate, "EEEE")}</p>
        </div>
        <div className="w-3/4">
          {events.map((event) => (
            <EventCard key={event.key} event={event} />
          ))}
        </div>
      </div>
    );
  };

  const activeEvents = showPastEvents ? pastEvents : currentEvents;

  return (
    <div className="container mx-auto my-8 max-w-[59rem]">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h4 className="text-2xl">Events</h4>
          <div className="flex rounded-md overflow-hidden">
            <Button
              variant={showPastEvents ? "outline" : "default"}
              onClick={() => setShowPastEvents(false)}
              className="rounded-r-none"
            >
              Upcoming
            </Button>
            <Button
              variant={showPastEvents ? "default" : "outline"}
              onClick={() => setShowPastEvents(true)}
              className="rounded-l-none"
            >
              Past
            </Button>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Event</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[960px] mx-auto">
            <AddEvent />
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-300 rounded h-24 mt-2"></div>
        ))
      ) : activeEvents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {showPastEvents ? "No past events found" : "No upcoming events found"}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(groupEventsByDate(activeEvents))
            .sort((a, b) => {
              const dateA = new Date(a[0]).getTime();
              const dateB = new Date(b[0]).getTime();
              return showPastEvents ? dateB - dateA : dateA - dateB;
            })
            .map(([date, events]) => renderEventSection(date, events))}
        </div>
      )}
    </div>
  );
};

export default Events;
