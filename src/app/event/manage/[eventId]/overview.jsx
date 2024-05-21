"use client";

import { addHours, roundToNearestHalfHour } from "@/components/event/utils";
import ImageUpload from "@/components/image-upload";
import firebase from "@/firebase/config";
import useRoleData from "@/hooks/use-role";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ManageEventForm from "./manage-form";

const formSchema = z.object({
  eventName: z.string().min(2).max(50),
  eventDate: z.date(),
  eventType: z.string(),
});

const Overview = () => {
  const [formData, setFormData] = useState({
    name: "",
    startDate: roundToNearestHalfHour(new Date()),
    endDate: addHours(roundToNearestHalfHour(new Date()), 1),
    location: "",
    organization: "",
    imgid: "default",
    description: "",
    webLink: "",
    tags: [],
    email: "",
  });
  const [uploading, setUploading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      eventDate: new Date(),
      eventType: "",
    },
  });

  const [image64, setImage64] = useState(null);
  const [currImage, setCurrImage] = useState(null);
  const [event, setEvent] = useState(null);
  const { databaseTags, groups, adminSignedIn, leaderSignedIn } = useRoleData();
  const router = useRouter();
  const { eventId } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      const snapshot = await eventRef.once("value");
      const fetchedEvent = snapshot.val();
      setEvent({
        ...fetchedEvent,
        endDate: moment(fetchedEvent.startDate).add(
          fetchedEvent.duration,
          "minutes"
        ),
        tags: fetchedEvent.tags.split(","),
      });

      // Get the existing image
      const imageUrl = await firebase.storage
        .ref("Images")
        .child(fetchedEvent.imgid + ".jpg")
        .getDownloadURL();
      setImage64(imageUrl);
      setCurrImage(imageUrl);
    };

    fetchEvent();
  }, [eventId]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    handleImageFileChanged(file, (uri) => setImage64(uri));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };
  const handleDateChange = (field, date) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      [field]: date ? date.format("YYYY-MM-DD HH:mm") : null,
    }));
  };

  const handleCancelEvent = async () => {
    if (
      window.confirm(
        "Cancel and permanently delete this event. This operation cannot be undone. Are you sure you want to cancel this event?"
      )
    ) {
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      await eventRef.remove();
      alert("Event canceled successfully!");
      router.push("/events");
    }
  };

  const saveImage = (ref, image) => {
    if (image !== defaultImage) {
      setUploading(true);
      displayMessage("Uploading Image...");
      const firebaseStorageRef = firebase.storage.ref(ref);
      const id = Date.now().toString();
      const imageRef = firebaseStorageRef.child(id + ".jpg");

      const i = image.indexOf("base64,");
      const buffer = Buffer.from(image.slice(i + 7), "base64");
      const file = new File([buffer], id);

      imageRef
        .put(file)
        .then(() => {
          return imageRef.getDownloadURL();
        })
        .then((url) => {
          submitEvent(id);
        })
        .catch((error) => {
          console.log(error);
          displayMessage("Error Uploading Image");
        });
    } else {
      submitEvent();
    }
  };

  const submitEvent = (id = "default") => {
    const startDate = moment(event.startDate);
    const endDate = moment(event.endDate);
    const duration = endDate.diff(startDate, "minutes");

    const eventData = {
      ...event,
      startDate: startDate.format("YYYY-MM-DD HH:mm"),
      endDate: endDate.format("YYYY-MM-DD HH:mm"),
      duration: duration,
      imgid: id,
      email: firebase.auth.currentUser.email,
      tags: event.tags.toString(),
    };
    console.log("eventData", eventData);

    firebase.database
      .ref(`/current-events/${eventId}`)
      .update(eventData)
      .then(() => {
        setUploading(false);
        displayMessage("Event Updated");
      })
      .catch((error) => {
        console.log(error);
        displayMessage("Error Updating Event");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      event.name !== "" &&
      event.location !== "" &&
      event.organization !== ""
    ) {
      console.log("image64", image64);
      console.log("currImage", currImage);
      if (image64 !== currImage) {
        saveImage("Images", image64);
      } else {
        submitEvent(event.imgid);
      }
    } else {
      displayMessage("Required fields are not filled in.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload image64={image64} onImageUpload={handleImageUpload} />
          <ManageEventForm
            formData={formData}
            groups={groups}
            databaseTags={databaseTags}
            handleInputChange={handleInputChange}
          />
        </div>
      </form>
    </div>
  );
};

export default Overview;
