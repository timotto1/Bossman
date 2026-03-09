import { useEffect, useState } from "react";
import { Bars2Icon, TrashIcon } from "@heroicons/react/24/solid";
import { ImageIcon, LoaderCircle } from "lucide-react";
import Image from "next/image";

import { ImageUploader } from "./development-listing/image-uploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getFilenameFromSupabaseUrl } from "@/utils/storage";

export default function ListingItemImagesModal({
  enableUpload,
  open,
  handleOpenChange,
  listingImages,
  handleImagesUpload,
  deleteListingImage,
}: {
  enableUpload: boolean;
  open: boolean;
  handleOpenChange: (open: boolean) => void;
  listingImages: string[];
  handleImagesUpload: (base64s: string[]) => void;
  deleteListingImage: (url: string) => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagesList, setImagesList] = useState<string[]>([]);

  const handleImages = async () => {
    setIsLoading(true);
    try {
      const imagesToDelete = listingImages.filter(
        (img) => !imagesList.includes(img),
      );

      const deletePromises = imagesToDelete.map((url) =>
        deleteListingImage(url),
      );

      const newBase64s = imagesList.filter((b64) =>
        b64.startsWith("data:image/"),
      );

      await Promise.all(deletePromises);

      await handleImagesUpload(newBase64s);

      handleOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setImagesList(listingImages);
  }, [listingImages]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="[&>button]:hidden max-w-[95%] md:w-[552px] max-h-[95%] h-full w-full rounded-2xl">
        <DialogTitle className="font-bold text-[#26045D] text-2xl">
          All photos
        </DialogTitle>
        <div
          className={cn(
            "overflow-y-auto space-y-4 h-full",
            enableUpload && "max-h-[420px]",
          )}
        >
          {imagesList.map((image, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="gap-4 flex items-center">
                <Bars2Icon color="#7067B8" className="h-4 w-4" />
                <Image
                  src={image}
                  width={135}
                  height={70}
                  alt={`image-${index}`}
                  className="rounded-xl"
                />
                <p className="font-medium text-[#26045D] text-xs">
                  {getFilenameFromSupabaseUrl(image)}
                </p>
              </div>
              {enableUpload && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setImagesList((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <TrashIcon className="w-4 h-4" color="#921925" />
                </Button>
              )}
            </div>
          ))}
          {!imagesList.length && (
            <div className="flex flex-col items-center justify-center h-40 text-center text-[#9E9E9E] space-y-2">
              <ImageIcon className="h-10 w-10 opacity-60" />
              <p className="text-sm font-medium">No images uploaded</p>
              <p className="text-xs">Start by uploading your first image</p>
            </div>
          )}
        </div>
        {enableUpload && (
          <>
            <h6 className="font-medium text-xs text-[#26045D]">
              Add more photos
            </h6>
            <ImageUploader
              className="min-h-[180px]"
              isLoading={isLoading}
              onChange={(base64s) => setImagesList([...imagesList, ...base64s])}
            />
          </>
        )}
        <DialogFooter>
          <Button
            disabled={isLoading}
            className="bg-[#7747FF] hover:bg-[#6A3FE6] text-white rounded-full px-4 py-2 text-sm min-w-[184px] mx-auto"
            onClick={
              enableUpload ? handleImages : () => handleOpenChange(false)
            }
          >
            {isLoading && <LoaderCircle className="w-4 h-4 animate-spin" />}
            {isLoading ? "Updating..." : enableUpload ? "Save" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
