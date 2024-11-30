"use client";
import { format } from "date-fns";

import AddEvent from "@/components/event/add-event";
import EventCard from "@/components/event/event-card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import useEvents from "@/hooks/use-events";
const Events = () => {
  const { events, loading } = useEvents();

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

  return (
    <div className="container mx-auto my-8 max-w-[59rem]">
      <div className="flex justify-between items-center mb-8">
        <h4 className="text-2xl">Events</h4>

        <Dialog>
          <DialogTrigger className="font-bold py-2 px-4">
            Add Event
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
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(groupEventsByDate(events))
            .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
            .map(([date, events]) => renderEventSection(date, events))}
        </div>
      )}
    </div>
  );
};

export default Events;
