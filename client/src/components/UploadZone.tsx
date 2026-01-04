import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onImageSelected: (url: string) => void;
  isProcessing: boolean;
}

export function UploadZone({ onImageSelected, isProcessing }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // In a real app, we would upload to S3 here.
    // For this demo, we'll use a high-quality static Unsplash image to represent the "uploaded" file.
    // Simulating upload delay
    const demoImages = [
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1000&auto=format&fit=crop", // Farm field
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop", // Agriculture drone
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop", // Wheat field
    ];
    
    // Pick a random one to simulate variety
    const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)];
    onImageSelected(randomImage);
  }, [onImageSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    disabled: isProcessing,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group",
        isDragActive 
          ? "border-primary bg-primary/5 scale-[1.02]" 
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        isProcessing && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
        {isDragActive ? (
          <UploadCloud className="w-8 h-8 text-primary animate-bounce" />
        ) : (
          <ImageIcon className="w-8 h-8 text-primary/70" />
        )}
      </div>

      <h3 className="text-lg font-bold text-foreground mb-1">
        {isDragActive ? "Drop image now" : "Upload Drone Imagery"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        Drag and drop your aerial survey shots, or click to browse files.
      </p>
    </div>
  );
}
