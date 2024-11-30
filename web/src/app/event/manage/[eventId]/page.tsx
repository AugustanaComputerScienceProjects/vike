"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import firebase from "@/firebase/config";
import { Event } from "@/firebase/types";
import useRoleData from "@/hooks/use-role";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Guests from "./guests";
import Overview from "./overview";
import { toTitleCase } from "./util";

const ManageEventPage = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { eventId } = useParams();
  const { adminSignedIn, leaderSignedIn } = useRoleData();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = firebase.database.ref(`/current-events/${eventId}`);
        const snapshot = await eventRef.once("value");
        if (snapshot.exists()) {
          const eventData = snapshot.val();
          setEvent({ ...eventData, key: eventId });
        } else {
          toast.error("Event not found");
          router.push("/events");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Error loading event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  const handleCancelEvent = async () => {
    if (!adminSignedIn && !leaderSignedIn) {
      toast.error("You don't have permission to cancel events");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this event?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      await eventRef.remove();
      
      // Delete event image if it exists
      if (event?.imgid && event.imgid !== "default") {
        const imageRef = firebase.storage.ref("Images").child(`${event.imgid}.jpg`);
        await imageRef.delete();
      }
      
      toast.success("Event canceled successfully!");
      router.push("/events");
    } catch (error) {
      console.error("Error canceling event:", error);
      toast.error("Error canceling event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (data) => {
    if (!adminSignedIn && !leaderSignedIn) {
      toast.error("You don't have permission to update events");
      return;
    }

    setIsSubmitting(true);
    try {
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      await eventRef.update({
        ...data,
        lastUpdated: new Date().toISOString(),
      });
      
      toast.success("Event updated successfully!");
      setEvent((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Error updating event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!event) {
    return null;
  }

  if (!adminSignedIn && !leaderSignedIn) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-500">
          You don't have permission to manage this event
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{toTitleCase(event.name)}</h1>
        <Button 
          variant="destructive" 
          onClick={handleCancelEvent}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Canceling..." : "Cancel Event"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview 
            event={event} 
            onSubmit={handleUpdateEvent}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
        <TabsContent value="guests">
          <Guests event={event} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageEventPage;
