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
import { Textarea } from "@/components/ui/textarea";
import firebase from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { handleImageFileChanged } from "./utils";

const formSchema = z.object({
  name: z.string().min(1, "Calendar name is required"),
  description: z.string().min(1, "Description is required"),
});

const CalendarSettings = ({ calendar }) => {
  const { toast } = useToast();
  const [profile64, setProfile64] = React.useState(calendar?.profileUrl);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: calendar?.name || "",
      description: calendar?.description || "",
    },
  });

  const handleProfileUpload = (event) => {
    const file = event.target.files[0];
    handleImageFileChanged(file, (uri) => setProfile64(uri));
  };

  const handleProfileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleImageFileChanged(file, (uri) => setProfile64(uri));
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      
      // Handle image upload if changed
      let profileId = calendar.profileId;
      if (profile64 !== calendar.profileUrl) {
        const firebaseStorageRef = firebase.storage.ref("Profiles");
        const id = Date.now().toString();
        const imageRef = firebaseStorageRef.child(id + ".png");

        const i = profile64.indexOf("base64,");
        const buffer = Buffer.from(profile64.slice(i + 7), "base64");
        const file = new File([buffer], id);

        await imageRef.put(file);
        await imageRef.getDownloadURL();
        profileId = id;
      }

      // Update calendar data
      await firebase.database
        .ref(`/calendars/${calendar.key}`)
        .update({
          ...data,
          profileId,
        });

      toast({
        title: "Success",
        description: "Calendar updated successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update calendar",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <ImageUpload
          image64={profile64}
          onImageUpload={handleProfileUpload}
          onImageDrop={handleProfileDrop}
          className="w-32 h-32 rounded-full"
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calendar Name</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CalendarSettings; 