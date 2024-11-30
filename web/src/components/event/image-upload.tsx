import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ImageUploadProps {
  image64: string;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  className?: string;
}

const ImageUpload = ({ image64, onImageUpload, onImageDrop, className }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={`w-full h-[300px] flex justify-center items-center relative mt-4 mb-8 border-2 border-dashed rounded-lg transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
      } ${className}`}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        onImageDrop(e);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
    >
      {image64 && (
        <div className="relative w-full h-full">
          <Image 
            src={image64} 
            alt="Event" 
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
      <label className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
        <ImageIcon className="h-6 w-6" />
        <input 
          type="file" 
          accept="image/*"
          onChange={onImageUpload}
          className="hidden" 
        />
      </label>
    </div>
  );
};

export default ImageUpload;
