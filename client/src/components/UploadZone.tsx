import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

interface UploadZoneProps {
  onImageSelected: (url: string) => void;
  isProcessing: boolean;
}

/**
 * Resize and compress an image file to reduce payload size before upload.
 * Returns a JPEG data URL with max dimension capped at MAX_DIMENSION.
 */
function resizeAndCompress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Only resize if larger than max dimension
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round(height * (MAX_DIMENSION / width));
          width = MAX_DIMENSION;
        } else {
          width = Math.round(width * (MAX_DIMENSION / height));
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export function UploadZone({ onImageSelected, isProcessing }: UploadZoneProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const compressed = await resizeAndCompress(file);
      onImageSelected(compressed);
    } catch {
      // Fallback to raw read if resize fails
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        onImageSelected(url);
      };
      reader.readAsDataURL(file);
    }
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
