import defaultImage from "@/assets/default.jpg";
import { Button } from "@/components/ui/button";
import firebase from "@/firebase/config";
import useRoleData from "@/hooks/use-role";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Form } from "../ui/form";
import AddEventForm from "./add-event-form";
import ImageUpload from "./image-upload";
import {
  addHours,
  handleImageFileChanged,
  roundToNearestHalfHour,
} from "./utils";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string(),
  organization: z.string(),
  tags: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  webLink: z.string().optional(),
  description: z.string(),
  email: z.string().email(),
});

const AddEvent = () => {
  const [image64, setImage64] = useState(defaultImage);
  const [uploading, setUploading] = useState(false);
  const { adminSignedIn, leaderSignedIn, databaseTags, groups, calendars } =
    useRoleData();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startDate: roundToNearestHalfHour(new Date()),
      endDate: addHours(roundToNearestHalfHour(new Date()), 1),
      location: "",
      organization: "",
      tags: [],
      webLink: "",
      description: "",
      email: "",
      calendar: "",
    },
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    handleImageFileChanged(file, (uri) => setImage64(uri));
  };

  const saveImage = async (ref, image, imageName) => {
    if (image !== defaultImage) {
      setUploading(true);
      toast("Uploading Image...");
      const firebaseStorageRef = firebase.storage.ref(ref);
      const id = Date.now().toString();
      const imageRef = firebaseStorageRef.child(id + ".jpg");

      const i = image.indexOf("base64,");
      const buffer = Buffer.from(image.slice(i + 7), "base64");
      const file = new File([buffer], id);

      try {
        await imageRef.put(file);
        const url = await imageRef.getDownloadURL();
        return id;
      } catch (error) {
        console.error("Error uploading image", error);
        toast("Error Uploading Image");
        return null;
      }
    }
  };

  const submitEvent = async (values, imageId) => {
    const startDate = new Date(values.startDate);
    const endDate = new Date(values.endDate);
    const duration = (endDate - startDate) / 60000; // Convert milliseconds to minutes

    const eventData = {
      ...values,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: duration,
      imgid: imageId,
      email: firebase.auth.currentUser.email,
      tags: values.tags.map((tag) => tag.label).join(","),
    };

    try {
      const newEventRef = await firebase.database
        .ref("/current-events")
        .push(eventData);
      updateEventCalendar(newEventRef.key, eventData, values.calendar);
      toast("Event Added");
      form.reset();
    } catch (error) {
      console.error("Error adding event", error);
      toast("Error Adding Event");
    }
  };

  const onSubmit = async (values) => {
    console.log("submitting");
    setUploading(true);
    try {
      const imageId = await saveImage("Images", image64);
      await submitEvent(values, imageId);
    } catch (error) {
      console.error("Failed to submit event", error);
      form.setError("form", { message: "Failed to submit event." });
    } finally {
      setUploading(false);
    }
  };

  const updateEventCalendar = async (eventId, eventData, calendar) => {
    const calendarRef = firebase.database
      .ref(`/calendars`)
      .orderByChild("name");
    const snapshot = await calendarRef.once("value");
    const calendars = snapshot.val();

    for (const [key, value] of Object.entries(calendars)) {
      if (value.name === calendar) {
        let eventsCalendar = value.eventsCalendar || {};
        eventsCalendar[eventId] = eventData;
        await firebase.database
          .ref(`/calendars/${key}`)
          .update({ eventsCalendar });
        return;
      }
    }

    toast(`Calendar ${calendar} does not exist.`);
  };

  return (
    <div className="p-4">
      <h4 className="text-2xl font-bold mb-4">Add Event</h4>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <ImageUpload image64={image64} onImageUpload={handleImageUpload} />
          <div>
            <AddEventForm
              form={form}
              groups={groups}
              databaseTags={databaseTags}
            />
            <Button type="submit" className="mt-4 w-full" disabled={uploading}>
              {adminSignedIn || leaderSignedIn ? "Add Event" : "Request Event"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddEvent;
