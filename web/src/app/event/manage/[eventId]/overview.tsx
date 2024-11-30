"use client";

import ImageUpload from "@/components/event/image-upload";
import firebase from "@/firebase/config";
import useRoleData from "@/hooks/use-role";
import { addMinutes, differenceInMinutes, format, parseISO } from "date-fns";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ManageEventForm from "./manage-form";

const Overview = () => {


  const [image64, setImage64] = useState(null);
  const [currImage, setCurrImage] = useState(null);
  const [event, setEvent] = useState(null);
  const { databaseTags, groups } = useRoleData();
  const { eventId } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      const snapshot = await eventRef.once("value");
      const fetchedEvent = snapshot.val();
      setEvent({
        ...fetchedEvent,
        endDate: addMinutes(parseISO(fetchedEvent.startDate), fetchedEvent.duration),
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

  const handleImageFileChanged = (file, callback) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const saveImage = (ref, image) => {
    if (image !== currImage) {
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
        .then(() => {
          submitEvent(id);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      submitEvent();
    }
  };

  const submitEvent = (id = "default") => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    const duration = differenceInMinutes(endDate, startDate);

    const eventData = {
      ...event,
      startDate: format(startDate, "yyyy-MM-dd HH:mm"),
      endDate: format(endDate, "yyyy-MM-dd HH:mm"),
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
      })
      .catch((error) => {
        console.log(error);
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
      alert("Required fields are not filled in.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload image64={image64} onImageUpload={handleImageUpload} onImageDrop={handleImageUpload} className="w-full" />
          <ManageEventForm
            event={event}
            groups={groups}
            databaseTags={databaseTags}
            onSubmit={handleInputChange}
          />
        </div>
      </form>
    </div>
  );
};

export default Overview;
