import defaultImage from "@/assets/default.jpg";
import firebase from "@/firebase/config";
import { Event } from "@/firebase/types";
import { useGroups } from "@/hooks/use-groups";
import { useTags } from "@/hooks/use-tags";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { addHours, format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { roundToNearestHalfHour } from "../calendar/utils";
import AddEventForm from "./add-event-form";
import ImageUpload from "./image-upload";

const formSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  duration: z.number().min(0),
  location: z.string().min(1, "Location is required"),
  organization: z.string().min(1, "Organization is required"),
  webLink: z.string().default(""),
  tags: z.array(z.string()).default([]),
  email: z.string().email("Invalid email address"),
});

interface AddEventProps {
  calendarId?: string;
  onSuccess?: () => void;
}

const AddEvent = ({ calendarId, onSuccess }: AddEventProps) => {
  const { toast } = useToast();
  const [image64, setImage64] = useState<string>(defaultImage.src);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { groups, isLoading: groupsLoading } = useGroups();
  const { tags, isLoading: tagsLoading } = useTags();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startDate: format(roundToNearestHalfHour(new Date()), "yyyy-MM-dd'T'HH:mm"),
      endDate: format(addHours(roundToNearestHalfHour(new Date()), 1), "yyyy-MM-dd'T'HH:mm"),
      duration: 0,
      location: "",
      organization: "",
      description: "",
      tags: [],
      email: "",
      webLink: "",
    },
  });

  const handleStartDateChange = (value: string) => {
    const startDate = new Date(value);
    const endDate = addHours(startDate, 1);
    form.setValue("startDate", value);
    form.setValue("endDate", format(endDate, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveImage = async (image: string): Promise<string> => {
    if (image === defaultImage.src) {
      return "default";
    }

    try {
      const timestamp = Date.now().toString();
      const imageRef = firebase.storage.ref("Images").child(`${timestamp}.jpg`);

      // Remove the data:image/jpeg;base64, prefix
      const base64Data = image.split(',')[1];
      
      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'image/jpeg' });
      
      // Upload image
      await imageRef.put(blob);
      return timestamp;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;

    // Validate required fields
    if (!data.name || !data.location || !data.organization) {
      toast({
        title: "Error",
        description: "Required fields are not filled in",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload image and get ID
      const imgid = await saveImage(image64);

      // Calculate duration
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

      // Validate end date is after start date
      if (endDate <= startDate) {
        toast({
          title: "Error",
          description: "End date must be after start date",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Create event data
      const eventData: Event = {
        name: data.name,
        description: data.description,
        startDate: format(startDate, "yyyy-MM-dd HH:mm"),
        endDate: format(endDate, "yyyy-MM-dd HH:mm"),
        duration,
        location: data.location,
        organization: data.organization,
        imgid,
        webLink: data.webLink || "",
        tags: data.tags.join(','),
        email: data.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // If we have an image URL, add it
      if (image64 !== defaultImage.src) {
        const imageRef = firebase.storage.ref("Images").child(`${imgid}.jpg`);
        const imageUrl = await imageRef.getDownloadURL();
        eventData.image = imageUrl;
        eventData.imageUrl = imageUrl;
      }

      console.log("Event data created:", eventData);

      // Save to current-events first
      const newEventRef = await firebase.database
        .ref("/current-events")
        .push(eventData);

      // Add the generated key to the event data
      const eventWithKey = {
        ...eventData,
        id: newEventRef.key,
        key: newEventRef.key,
      };

      // Update the event with its key
      await firebase.database
        .ref(`/current-events/${newEventRef.key}`)
        .set(eventWithKey);

      // Then update the calendar
      if (calendarId) {
        await firebase.database
          .ref(`/calendars/${calendarId}/eventsCalendar/${newEventRef.key}`)
          .set(eventWithKey);
      }

      // Show success toast before resetting form
      toast({
        title: "Success",
        description: "Event created successfully",
        duration: 3000,
      });

      // Small delay before resetting form to ensure toast is visible
      setTimeout(() => {
        form.reset();
        setImage64(defaultImage.src);
        onSuccess?.();
      }, 100);

    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
        duration: 5000,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ImageUpload
            image64={image64}
            onImageUpload={handleImageUpload}
            onImageDrop={handleImageDrop}
            className="w-full h-[400px] md:h-[600px] object-cover rounded-lg"
            isUploading={isSubmitting}
          />
        </div>

        <div className="space-y-4">
          <AddEventForm
            form={form}
            groups={groups}
            tags={tags}
            isSubmitting={isSubmitting}
            groupsLoading={groupsLoading}
            tagsLoading={tagsLoading}
            handleStartDateChange={handleStartDateChange}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default AddEvent;
