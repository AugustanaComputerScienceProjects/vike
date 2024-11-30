import defaultImage from "@/assets/default.jpg";
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
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      throw error;
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {

    // Validate required fields
    if (!data.name || !data.location || !data.organization) {
      toast({
        title: "Error",
        description: "Required fields are not filled in",
        variant: "destructive",
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

      toast({
        title: "Success",
        description: "Event created successfully",
      });
      
      form.reset();
      setImage64(defaultImage.src);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const handleStartDateChange = (value: string) => {
    const startDate = new Date(value);
    const endDate = addHours(startDate, 1);
    form.setValue("startDate", value);
    form.setValue("endDate", format(endDate, "yyyy-MM-dd'T'HH:mm"));
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
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit)(e);
          }} 
          className="space-y-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
        >
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
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      onChange={(e) => handleStartDateChange(e.target.value)}
                    />
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
                      <SelectValue placeholder={groupsLoading ? "Loading..." : "Select organization"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={`org-${group}`} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter contact email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="webLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Web Link (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter web link" {...field} />
                </FormControl>
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

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange([...field.value, value])}
                  value={field.value[field.value.length - 1] || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={tagsLoading ? "Loading..." : "Select tags"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={`tag-${tag}`} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value.map((tag, index) => (
                    <div
                      key={`selected-${tag}-${index}`}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = [...field.value];
                          newTags.splice(index, 1);
                          field.onChange(newTags);
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddEvent;
