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
import { DateTimePicker } from "@/components/ui/time-picker/date-time-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  eventName: z.string().min(2).max(50),
  eventDate: z.date(),
  eventType: z.string(),
});

const ManageEventForm = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      eventDate: new Date(),
      eventType: "",
    },
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="eventName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter event name" {...field} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.eventName && "Event name is required."}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Date</FormLabel>
              <FormControl>
                <DateTimePicker {...field} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.eventDate && "Event date is required."}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <FormControl>
                <Input placeholder="Enter event type" {...field} />
              </FormControl>
              <FormMessage>
                {form.formState.errors.eventType && "Event type is required."}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-4">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default ManageEventForm;
