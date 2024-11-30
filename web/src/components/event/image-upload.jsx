import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";

const ImageUpload = ({ image64, onImageUpload, onImageDrop }) => {
  return (
    <div
      className="w-full h-[300px] flex justify-center items-center relative mt-4 mb-8"
      onDrop={onImageDrop}
      onDragOver={(event) => event.preventDefault()}
    >
      {image64 ? (
        <div className="relative w-full h-full">
          <Image 
            src={image64} 
            alt="Event" 
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ) : (
        <p className="text-center">
          Drag and drop an image here or click the button below to upload
        </p>
      )}
      <label className="absolute bottom-2 right-2 bg-black text-white p-2 cursor-pointer rounded-lg z-10">
        <ImageIcon className="h-6 w-6" />
        <input type="file" accept="image/*" hidden onChange={onImageUpload} />
      </label>
    </div>
  );
};

export default ImageUpload;
