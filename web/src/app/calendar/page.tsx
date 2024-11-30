"use client";

import AddCalendar from "@/components/calendar/add-calendar";
import CalendarCard from "@/components/calendar/calendar-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import useCalendars from "@/hooks/use-calendars";
import { useRouter } from "next/navigation";

const Calendars = () => {
  const { calendars, loading, refreshCalendars } = useCalendars();
  const router = useRouter();

  const handleCalendarClick = (calendarId) => {
    router.push(`/calendar/${calendarId}`);
  };

  const renderCalendarSection = (calendars) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {calendars.map((calendar) => (
          <CalendarCard
            key={calendar.key}
            calendar={calendar}
            onClick={() => handleCalendarClick(calendar.key)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendars</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Calendar</Button>
          </DialogTrigger>
          <DialogContent>
            <AddCalendar onClose={() => refreshCalendars()} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      ) : calendars.length > 0 ? (
        renderCalendarSection(calendars)
      ) : (
        <div className="text-center mt-8">No calendars found</div>
      )}
    </div>
  );
};

export default Calendars;
