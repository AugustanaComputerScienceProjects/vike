import { Image } from "lucide-react";

const ImageUpload = ({ image64, onImageUpload, onImageDrop }) => {
  return (
    <div
      className="w-full flex justify-center items-center relative mt-4 mb-8"
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
        <p className="text-center">
          Drag and drop an image here or click the button below to upload
        </p>
      )}
      <label className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-700 text-white p-2 cursor-pointer">
        <Image className="h-6 w-6" />
        <input type="file" accept="image/*" hidden onChange={onImageUpload} />
      </label>
    </div>
  );
};

export default ImageUpload;
