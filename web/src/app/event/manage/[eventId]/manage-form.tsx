"use client";

import Editor from "@/components/editor/editor";
import ImageUpload from "@/components/event/image-upload";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/time-picker/date-time-picker";
import firebase from "@/firebase/config";
import { Event } from "@/firebase/types";
import { useGroups } from "@/hooks/use-groups";
import { useTags } from "@/hooks/use-tags";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().min(1, "Location is required"),
  organization: z.string().min(1, "Organization is required"),
  tags: z.array(z.string()).default([]),
  webLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().min(1, "Description is required"),
  imgid: z.string().optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type FormData = z.infer<typeof formSchema>;

const ManageEventForm = ({ 
  event, 
  onSubmit, 
  isSubmitting = false 
}: { 
  event: Event; 
  onSubmit: (data: FormData) => Promise<void>; 
  isSubmitting?: boolean;
}) => {
  const [image64, setImage64] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const { groups, isLoading: isLoadingGroups, error: groupsError } = useGroups();
  const { tags: databaseTags, isLoading: isLoadingTags, error: tagsError } = useTags();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startDate: new Date(),
      endDate: new Date(),
      location: "",
      organization: "",
      tags: [],
      webLink: "",
      description: "",
      imgid: "default",
    },
  });

  // Load initial image when event changes
  useEffect(() => {
    const loadImage = async () => {
      if (!event?.imgid || event.imgid === "default") {
        setImage64(null);
        return;
      }

      setIsLoadingImage(true);
      try {
        const imageRef = firebase.storage.ref("Images").child(`${event.imgid}.jpg`);
        const url = await imageRef.getDownloadURL();
        setImage64(url);
      } catch (error) {
        console.error("Error loading image:", error);
        toast.error("Failed to load event image");
        setImage64(null);
      } finally {
        setIsLoadingImage(false);
      }
    };

    loadImage();
  }, [event?.imgid]);

  // Load form data when event changes
  useEffect(() => {
    if (event) {
      form.reset({
        name: event.name,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        location: event.location,
        organization: event.organization,
        tags: Array.isArray(event.tags) ? event.tags : event.tags ? [event.tags] : [],
        webLink: event.webLink || "",
        description: event.description || "",
        imgid: event.imgid || "default",
      });
    }
  }, [event, form]);

  const handleEditorUpdate = (content: string) => {
    form.setValue("description", content, { shouldValidate: true });
  };

  const handleTagChange = (value: string) => {
    const currentTags = form.getValues("tags");
    if (value && !currentTags.includes(value.trim())) {
      form.setValue("tags", [...currentTags, value.trim()]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleImageFileChanged = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFileChanged(file);
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageFileChanged(file);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setIsUploadingImage(true);
    try {
      let imgid = data.imgid || "default";

      // Only handle image upload if there's a new image
      if (image64?.startsWith('data:')) {
        const imageRef = firebase.storage.ref("Images");
        const newImgId = Date.now().toString();
        const newImageRef = imageRef.child(`${newImgId}.jpg`);

        // Convert base64 to blob
        const response = await fetch(image64);
        const blob = await response.blob();

        // Upload new image
        await newImageRef.put(blob, {
          contentType: 'image/jpeg',
        });

        // Delete old image if it exists and isn't default
        if (event?.imgid && event.imgid !== "default") {
          try {
            const oldImageRef = imageRef.child(`${event.imgid}.jpg`);
            await oldImageRef.delete();
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }

        imgid = newImgId;
      }

      // Submit form data with image ID
      await onSubmit({
        ...data,
        imgid,
      });
    } catch (error) {
      console.error("Error handling image upload:", error);
      toast.error("Error uploading image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoadingGroups || isLoadingTags) {
    return <div className="flex justify-center p-4">Loading form data...</div>;
  }

  if (groupsError || tagsError) {
    return (
      <div className="text-red-500 p-4">
        Error loading form data. Please try again later.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ImageUpload
            image64={image64 || ""}
            onImageUpload={handleImageUpload}
            onImageDrop={handleImageDrop}
            className="aspect-video w-full h-[300px]"
            isUploading={isUploadingImage || isLoadingImage}
            priority={true}
          />
        </div>

        <div className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
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
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
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
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups.map((group, index) => (
                      <SelectItem key={`group-${index}-${group}`} value={group}>
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
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <Select
                  value=""
                  onValueChange={handleTagChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tags" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {databaseTags
                      .filter(tag => !field.value.includes(tag))
                      .map((tag, index) => (
                        <SelectItem key={`tag-${index}-${tag}`} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value
                    .filter(Boolean)
                    .map((tag, index) => (
                      <div
                        key={`selected-${index}-${tag}`}
                        className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
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

          <FormField
            control={form.control}
            name="webLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Web Link</FormLabel>
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
                  <Editor 
                    content={field.value} 
                    onUpdate={handleEditorUpdate}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isUploadingImage}
          >
            {isSubmitting || isUploadingImage ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ManageEventForm;
