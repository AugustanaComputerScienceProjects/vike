import { Button } from "@/components/ui/button";
import React from "react";

const ImageUpload = ({ image64, onImageUpload, onImageDrop }) => {
  return (
    <div
      className="w-full h-full flex justify-center items-center relative"
      onDrop={onImageDrop}
      onDragOver={(event) => event.preventDefault()}
    >
      {image64 ? (
        <img
          src={image64}
          alt="Event"
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <div className="text-center">
          Drag and drop an image here or click the button below to upload
        </div>
      )}
      <Button
        as="label"
        className="absolute bottom-1 right-1 bg-primary text-white hover:bg-primary-dark"
      >
        <span className="material-icons">add_photo_alternate</span>
        <input type="file" accept="image/*" hidden onChange={onImageUpload} />
      </Button>
    </div>
  );
};

export default ImageUpload;
