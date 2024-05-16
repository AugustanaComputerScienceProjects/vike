"use client";

import AddCalendar from "@/components/calendar/add-calendar";
import CalendarCard from "@/components/calendar/calendar-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import useCalendars from "@/hooks/use-calendars";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Calendars = () => {
  const { calendars, loading, refreshCalendars } = useCalendars();
  const [isAddCalendarFormOpen, setIsAddCalendarFormOpen] = useState(false);
  const router = useRouter();

  const renderCalendarSection = (calendars) => {
    return (
      <div className="flex flex-wrap mt-2 justify-between items-center mx-auto p-12">
        {calendars.map((calendar) => (
          <CalendarCard
            key={calendar.key}
            calendar={calendar}
            onClick={() => router.push(`/calendar-manage/${calendar.key}`)}
          />
        ))}
      </div>
    );
  };

  const handleAddCalendarClick = () => {
    setIsAddCalendarFormOpen(true);
  };

  const handleAddCalendarFormClose = () => {
    setIsAddCalendarFormOpen(false);
    refreshCalendars();
  };

  return (
    <div className="container mx-auto p-12">
      <div className="flex flex-row justify-between items-center">
        <div className="text-2xl font-bold">Calendars</div>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={handleAddCalendarClick}>Add Calendar</Button>
          </DialogTrigger>
          <DialogContent>
            <AddCalendar onClose={handleAddCalendarFormClose} />
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="flex flex-col space-y-3 mt-2  mx-auto p-12">
          {[...Array(8)].map((e, i) => (
            <Skeleton className="h-[125px] w-full rounded-xl" />
          ))}
        </div>
      ) : calendars.length > 0 ? (
        renderCalendarSection(calendars)
      ) : (
        <div className="text-center">No calendars found</div>
      )}
    </div>
  );
};

export default Calendars;
