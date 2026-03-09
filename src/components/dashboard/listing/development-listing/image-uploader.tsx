"use client";

import { useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type ImageUploaderProps = {
  isLoading: boolean;
  onChange: (base64s: string[]) => void;
  className?: string;
};

export function ImageUploader({
  isLoading,
  onChange,
  className = "min-h-[276px]",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);

    Promise.all(
      fileArray.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === "string") {
                resolve(reader.result);
              } else {
                reject("Invalid file");
              }
            };
            reader.readAsDataURL(file);
          }),
      ),
    ).then((base64s) => {
      onChange(base64s);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        className={cn(
          "relative rounded-xl flex items-center justify-center border border-dashed cursor-pointer group transition-all",
          className,
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-[#9E9E9E] hover:border-gray-600",
        )}
        onClick={handleClick}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="relative space-y-2 flex flex-col items-center justify-center h-full text-gray-500 group-hover:text-gray-700 py-10">
          <Image
            src="/images/cloud-upload.png"
            height={32}
            width={32}
            alt="cloud upload"
          />
          <p className="text-sm font-medium text-[#26045D]">Drag and drop</p>
          <p className="text-xs text-[#26045D]">
            You can add multiple photos at once
          </p>
        </div>

        {/* 🔄 Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20 rounded-xl">
            <LoaderCircle className="w-8 h-8 animate-spin text-[#26045D]" />
            <p className="text-sm text-[#26045D] font-medium">
              Uploading images...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
