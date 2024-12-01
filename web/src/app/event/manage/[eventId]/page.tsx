"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import firebase from "@/firebase/config";
import { Event } from "@/firebase/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Guests from "./guests";
import ManageEventForm from "./manage-form";
import Overview from "./overview";

interface ManageEventPageProps {
  params: {
    eventId: string;
  };
}

const ManageEventPage = ({ params }: ManageEventPageProps) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Try current events first
        let eventRef = firebase.database.ref(`/current-events/${params.eventId}`);
        let snapshot = await eventRef.once("value");
        
        // If not found in current events, try past events
        if (!snapshot.exists()) {
          eventRef = firebase.database.ref(`/past-events/${params.eventId}`);
          snapshot = await eventRef.once("value");
        }

        if (snapshot.exists()) {
          const eventData = snapshot.val();
          eventData.key = snapshot.key;
          setEvent(eventData);
        } else {
          toast.error("Event not found");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.eventId]);

  const handleSubmit = async (data: any) => {
    if (!event) return;

    setIsSubmitting(true);
    try {
      const eventRef = firebase.database.ref(`/current-events/${params.eventId}`);
      await eventRef.update(data);
      toast.success("Event updated successfully");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const eventDate = new Date(event.startDate);
  const isPastEvent = eventDate < new Date();

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          {!isPastEvent && <TabsTrigger value="edit">Edit Event</TabsTrigger>}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview">
            <Overview event={event} />
          </TabsContent>

          <TabsContent value="guests">
            <Guests event={event} />
          </TabsContent>

          {!isPastEvent && (
            <TabsContent value="edit">
              <div className="bg-white rounded-lg p-6">
                <ManageEventForm
                  event={event}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default ManageEventPage;
