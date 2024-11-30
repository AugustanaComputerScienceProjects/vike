import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import firebase from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { handleImageFileChanged } from "../calendar/utils";
import ImageUpload from "./image-upload";

const formSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z.string().optional(),
  organization: z.string().min(1, "Organization is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).optional(),
});

const AddEvent = ({ calendarId, onSuccess }) => {
  const { toast } = useToast();
  const [image64, setImage64] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      location: "",
      organization: "",
      description: "",
      tags: [],
    },
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    handleImageFileChanged(file, (uri) => setImage64(uri));
  };

  const handleImageDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleImageFileChanged(file, (uri) => setImage64(uri));
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Handle image upload if provided
      let imageId = null;
      if (image64) {
        const firebaseStorageRef = firebase.storage.ref("Events");
        const id = Date.now().toString();
        const imageRef = firebaseStorageRef.child(id + ".png");

        const i = image64.indexOf("base64,");
        const buffer = Buffer.from(image64.slice(i + 7), "base64");
        const file = new File([buffer], id);

        await imageRef.put(file);
        await imageRef.getDownloadURL();
        imageId = id;
      }

      // Create event data
      const eventData = {
        ...data,
        imageId,
        createdAt: new Date().toISOString(),
      };

      // Save to database
      await firebase.database
        .ref(`/calendars/${calendarId}/eventsCalendar`)
        .push(eventData);

      toast({
        title: "Success",
        description: "Event created successfully",
      });
      
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h2 className="text-lg font-semibold">Add New Event</h2>
        <p className="text-sm text-muted-foreground">
          Create a new event for your calendar
        </p>
      </div>

      <div className="flex justify-center">
        <ImageUpload
          image64={image64}
          onImageUpload={handleImageUpload}
          onImageDrop={handleImageDrop}
          className="w-full h-[200px] object-cover rounded-lg"
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter event name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="org1">Organization 1</SelectItem>
                    <SelectItem value="org2">Organization 2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter event description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddEvent;
