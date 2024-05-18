import defaultImage from "@/assets/default.jpg";
import { Button } from "@/components/ui/button";
import useRoleData from "@/hooks/use-role";
import React, { useState } from "react";
import AddEventForm from "./add-event-form";
import ImageUpload from "./image-upload";
import {
  addHours,
  handleImageFileChanged,
  roundToNearestHalfHour,
} from "./utils";

const AddEvent = () => {
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
  const [image64, setImage64] = useState(defaultImage);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { adminSignedIn, leaderSignedIn, databaseTags, groups } = useRoleData();
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    handleImageFileChanged(file, (uri) => setImage64(uri));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.name && formData.location && formData.organization) {
      // Assuming saveImage function exists and handles image saving and event submission
      saveImage("Images", image64);
    } else {
      setMessage("Required fields are not filled in.");
      setOpenSnackbar(true);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <div className="p-4">
      <h4 className="text-2xl font-bold mb-4">Add Event</h4>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload image64={image64} onImageUpload={handleImageUpload} />
          <div>
            <AddEventForm
              formData={formData}
              groups={groups}
              databaseTags={databaseTags}
              handleInputChange={handleInputChange}
            />
            <Button
              className="mt-4 w-full"
              onClick={handleSubmit}
              disabled={uploading}
            >
              {adminSignedIn || leaderSignedIn ? "Add Event" : "Request Event"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEvent;
