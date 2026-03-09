"use client";

import { useRef } from "react";
import { CloudArrowDownIcon } from "@heroicons/react/24/solid";

import { cn } from "@/lib/utils";

type XLSXUploaderProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
};

export function XLSXUploader({ value, onChange }: XLSXUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => inputRef.current?.click();

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && file.name.endsWith(".csv")) {
            onChange(file);
          }
        }}
      />

      <div
        className={cn(
          "relative h-32 rounded-xl border-2 border-dashed cursor-pointer group transition-all max-w-md mx-auto",
          value
            ? "border-[#26045D] bg-[#F0F0FE]"
            : "border-gray-200 hover:border-gray-300 bg-white",
        )}
        onClick={handleClick}
      >
        {value ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center space-y-2">
            <p className="text-sm font-semibold text-gray-700 truncate max-w-full">
              {value.name}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current!.value = "";
                  onChange(null);
                }}
                className="bg-red-500 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#26045D]">
            <CloudArrowDownIcon className="w-8 h-8 mb-2 text-[#26045D]" />
            <p className="text-sm font-medium">Upload completed CSV</p>
          </div>
        )}
      </div>
    </div>
  );
}
