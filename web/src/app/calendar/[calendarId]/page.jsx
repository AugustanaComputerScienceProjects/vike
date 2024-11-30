"use client";

import CalendarAdmins from "@/components/calendar/calendar-admins";
import CalendarEvents from "@/components/calendar/calendar-events";
import CalendarSettings from "@/components/calendar/calendar-settings";
import CalendarSubscribers from "@/components/calendar/calendar-subscribers";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCalendar from "@/hooks/use-calendar";
import { useParams } from "next/navigation";
import React from "react";

const ManageCalendar = () => {
  const { calendarId } = useParams();
  const { calendar, loading } = useCalendar(calendarId);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold">{calendar?.name}</h1>
        <p className="text-muted-foreground">{calendar?.description}</p>
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <CalendarEvents calendarId={calendarId} />
        </TabsContent>
        <TabsContent value="subscribers">
          <CalendarSubscribers calendarId={calendarId} />
        </TabsContent>
        <TabsContent value="admins">
          <CalendarAdmins calendarId={calendarId} />
        </TabsContent>
        <TabsContent value="settings">
          <CalendarSettings calendar={calendar} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageCalendar; 