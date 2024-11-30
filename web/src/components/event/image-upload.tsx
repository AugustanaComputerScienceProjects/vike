import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ImageUploadProps {
  image64: string;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  className?: string;
  isUploading?: boolean;
  priority?: boolean;
}

const ImageUpload = ({ 
  image64, 
  onImageUpload, 
  onImageDrop, 
  className,
  isUploading = false,
  priority = false
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    onImageDrop(e);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={`flex flex-col justify-center items-center relative border-2 border-dashed rounded-lg transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
      } ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {(!image64 || imageError) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {imageError ? "Failed to load image. Click to upload a new one." : "Drag and drop an image here or click to upload"}
          </p>
        </div>
      )}
      
      {image64 && !imageError && (
        <div className="relative w-full h-full">
          <Image 
            src={image64} 
            alt="Event" 
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
            onError={handleImageError}
          />
        </div>
      )}

      <label className={`absolute bottom-2 right-2 bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer hover:bg-primary/90 transition-colors ${
        isUploading ? 'opacity-50 cursor-not-allowed' : ''
      }`}>
        <ImageIcon className="h-6 w-6" />
        <input 
          type="file" 
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
          disabled={isUploading}
        />
      </label>
    </div>
  );
};

export default ImageUpload;
