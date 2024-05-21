"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import firebase from "@/firebase/config";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Guests from "./guests";
import Overview from "./overview";
import { toTitleCase } from "./util";

const ManageEventPage = () => {
  const [event, setEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const router = useRouter();
  const { eventId } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      const snapshot = await eventRef.once("value");
      if (snapshot.exists()) {
        setEvent(snapshot.val());
      } else {
        toast("Event not found.");
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleCancelEvent = async () => {
    if (window.confirm("Are you sure you want to cancel this event?")) {
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      await eventRef.remove();
      toast("Event canceled successfully!");
      router.push("/events");
    }
  };

  const handleUpdateEvent = async () => {
    const eventRef = firebase.database.ref(`/current-events/${eventId}`);
    await eventRef.update(event);
    toast("Event updated successfully!");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({ ...prev, [name]: value }));
  };

  if (!event) {
    return <div>Loading...</div>;
  }
  console.log(event);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{toTitleCase(event.name)}</h1>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview />
        </TabsContent>
        <TabsContent value="guests">
          <Guests />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageEventPage;
