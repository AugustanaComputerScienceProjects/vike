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
import { Group } from "@/hooks/use-groups";
import { UseFormReturn } from "react-hook-form";
import { useState } from 'react';

interface AddEventFormProps {
  form: UseFormReturn<any>;
  groups: Group[];
  tags: string[];
  isSubmitting: boolean;
  groupsLoading: boolean;
  tagsLoading: boolean;
  handleStartDateChange: (value: string) => void;
  onSubmit: (data: any) => Promise<void>;
}

const AddEventForm = ({ 
  form, 
  groups, 
  tags, 
  isSubmitting,
  groupsLoading,
  tagsLoading,
  handleStartDateChange,
  onSubmit 
}: AddEventFormProps): JSX.Element => {
  const [repeats, setRepeats] = useState(false);
  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
      >
        {/* Event Name */}
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

        {/* Date Fields */}
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
      
      {/* Repeat Event Checkbox */}
      <FormItem>
        <FormControl>
          <label htmlFor="repeatEvent" className="flex items-center space-x-2">
            <input
              id="repeatEvent"
              type="checkbox"
              checked={repeats}
              onChange={() => setRepeats(!repeats)}
              className="accent-primary h-4 w-4"
            />
            <span className="text-sm text-white">Repeat Event</span>
          </label>
        </FormControl>
      </FormItem>


  {repeats && (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="repeatFrequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Repeat Frequency</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="repeatUntil"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Repeat Until</FormLabel>
            <FormControl>
              <Input 
                type="datetime-local"
                {...field} 
                min={form.getValues('startDate')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    {form.watch('repeatFrequency') === 'weekly' && (
      <FormField
        control={form.control}
        name="repeatDays"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Repeat Days</FormLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                (day) => {
                  const isSelected = field.value?.includes(day);
                  return (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const newValue = isSelected
                            ? field.value.filter((d: string) => d !== day)
                            : [...(field.value || []), day];
                          field.onChange(newValue);
                        }}
                        className="accent-primary h-4 w-4"
                      />
                      <span className="text-sm">{day}</span>
                    </label>
                  );
                }
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    )}
  </div>
)}


        {/* Location */}
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

        {/* Organization */}
        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={groupsLoading ? "Loading..." : "Select organization"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={`org-${group.name}`} value={group.name}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
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

        {/* Web Link */}
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

        {/* Description */}
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

        {/* Tags */}
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
                {field.value.map((tag: string, index: number) => (
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
  );
};

export default AddEventForm;
