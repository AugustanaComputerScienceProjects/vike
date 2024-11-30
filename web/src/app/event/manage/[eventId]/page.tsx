"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import firebase from "@/firebase/config";
import useRoleData from "@/hooks/use-role";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Guests from "./guests";
import Overview from "./overview";
import { toTitleCase } from "./util";

const ManageEventPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
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

    if (window.confirm("Are you sure you want to cancel this event?")) {
      try {
        const eventRef = firebase.database.ref(`/current-events/${eventId}`);
        await eventRef.remove();
        
        // Delete event image if it exists
        if (event.imgid && event.imgid !== "default") {
          const imageRef = firebase.storage.ref("Images").child(`${event.imgid}.jpg`);
          await imageRef.delete();
        }
        
        toast.success("Event canceled successfully!");
        router.push("/events");
      } catch (error) {
        console.error("Error canceling event:", error);
        toast.error("Error canceling event");
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!event) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{toTitleCase(event.name)}</h1>
        {(adminSignedIn || leaderSignedIn) && (
          <Button variant="destructive" onClick={handleCancelEvent}>
            Cancel Event
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview />
        </TabsContent>
        <TabsContent value="guests">
          <Guests event={event} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageEventPage;
