"use client";

import Editor from "@/components/editor/editor";
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
import { Event } from "@/firebase/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().min(1, "Location is required"),
  organization: z.string().min(1, "Organization is required"),
  tags: z.array(z.string()).optional(),
  webLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().min(1, "Description is required"),
});

const ManageEventForm = ({ event, onSubmit, groups, databaseTags }: { event: Event, onSubmit: (data: z.infer<typeof formSchema>) => void, groups: string[], databaseTags: string[] }) => {
  const form = useForm({
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
    },
  });

  useEffect(() => {
    if (event) {
      form.reset({
        name: event.name,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        location: event.location,
        organization: event.organization,
        tags: event.tags || [],
        webLink: event.webLink || "",
        description: event.description || "",
      });
    }
  }, [event, form]);

  const handleEditorUpdate = (content) => {
    form.setValue("description", content, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group} value={group}>
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
                // @ts-ignore
                value={field.value }
                onValueChange={(value) => field.onChange([...field.value, value])}
                multiple
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tags" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {databaseTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map((tag) => (
                  <div
                    key={tag}
                    className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        field.onChange(field.value.filter((t) => t !== tag))
                      }
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

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Form>
  );
};

export default ManageEventForm;
