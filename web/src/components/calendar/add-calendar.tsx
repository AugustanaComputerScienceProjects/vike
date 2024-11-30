import vikeLogo from "@/assets/vike.png";
import ImageUpload from "@/components/event/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import firebase from "@/firebase/config";
import useRoleData from "@/hooks/use-role";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import AddCalendarForm from "./add-calendar-form";
import { handleImageFileChanged } from "./utils";

const formSchema = z.object({
  name: z.string().min(1, "Calendar name is required"),
  organization: z.string().min(1, "Organization is required"),
  description: z.string().min(1, "Description is required"),
});

const AddCalendar = ({ onClose }) => {
  const [profile64, setProfile64] = useState(vikeLogo);
  const [uploading, setUploading] = useState(false);
  const { groups } = useRoleData();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      organization: "",
      description: "",
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
      setUploading(true);
      
      // Handle image upload if changed
      let profileId = "vike";
      if (profile64 !== vikeLogo) {
        profileId = await saveImage("Profiles", profile64);
      }

      // Prepare calendar data
      const calendarData = {
        ...data,
        profileId,
        email: firebase.auth.currentUser.email,
        admins: [],
        subscribers: [],
        events: [],
      };

      // Save to database
      await firebase.database.ref("/calendars").push(calendarData);
      
      toast({
        title: "Success",
        description: "Calendar created successfully",
      });
      
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create calendar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const saveImage = async (ref, image) => {
    const firebaseStorageRef = firebase.storage.ref(ref);
    const id = Date.now().toString();
    const imageRef = firebaseStorageRef.child(id + ".png");

    const i = image.indexOf("base64,");
    const buffer = Buffer.from(image.slice(i + 7), "base64");
    const file = new File([buffer], id);

    await imageRef.put(file);
    await imageRef.getDownloadURL();
    
    return id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <ImageUpload
            image64={profile64}
            onImageUpload={handleProfileUpload}
            onImageDrop={handleProfileDrop}
            className="w-24 h-24 rounded-full"
          />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
              <AddCalendarForm groups={groups} />
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={uploading}
                >
                  {uploading ? "Creating..." : "Create Calendar"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddCalendar;
