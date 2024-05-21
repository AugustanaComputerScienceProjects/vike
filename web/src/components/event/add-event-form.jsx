import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React from "react";
import Editor from "../editor/editor";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { z } from "zod";
import LocationField from "../form/location-field";
import { Button } from "../ui/button";
import MultiSelector from "../ui/multi-selector";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { TimePicker } from "../ui/time-picker/time-picker";
import { addHours } from "./utils";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string(),
  organization: z.string(),
  tags: z.array(),
  webLink: z.string().optional(),
  description: z.string(),
});

const onSubmit = (data) => {
  console.log(data);
};

const AddEventForm = ({ form, groups, databaseTags }) => {
  const handleStartDateChange = (date) => {
    const newStartDate = date;
    const newEndDate = addHours(newStartDate, 1);
    form.setValue("startDate", newStartDate);
    form.setValue("endDate", newEndDate);
  };

  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="Event Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="startDate"
        render={({ field }) => (
          <FormItem className="flex flex-row justify-between gap-2">
            <FormLabel className="text-left flex items-center">
              Start Date
            </FormLabel>
            <Popover>
              <FormControl>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP HH:mm")
                    ) : (
                      <span>Pick start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
              </FormControl>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    handleStartDateChange(date);
                  }}
                  initialFocus
                />
                <div className="p-3 border-t border-border">
                  <TimePicker
                    setDate={(date) => handleStartDateChange(date)}
                    date={field.value}
                  />
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="endDate"
        render={({ field }) => (
          <FormItem className="flex flex-row justify-between gap-2 !mt-0">
            <FormLabel className="text-left flex items-center">
              End Date
            </FormLabel>
            <Popover>
              <FormControl>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP HH:mm")
                    ) : (
                      <span>Pick end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
              </FormControl>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
                <div className="p-3 border-t border-border">
                  <TimePicker setDate={field.onChange} date={field.value} />
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <LocationField
        form={form}
        control={form.control}
        name="location"
        label="Location"
        placeholder="Enter location"
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
                {groups.map((group, index) => (
                  <SelectItem key={index} value={group}>
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
            <FormControl>
              <MultiSelector
                value={field.value}
                onChange={field.onChange}
                options={databaseTags.map((tag) => ({
                  label: tag,
                  value: tag,
                }))}
                placeholder="Select tags..."
                emptyIndicator={
                  <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                    No tags found.
                  </p>
                }
              />
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
                {...field}
                content={field.value}
                onUpdate={(newDescription) => {
                  field.onChange(newDescription);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default AddEventForm;
