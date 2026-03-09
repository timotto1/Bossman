"use client";

import { useEffect, useState } from "react";
import { PhotoIcon } from "@heroicons/react/20/solid";
import { CameraIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

import { ImageUploader } from "./development-listing/image-uploader";
import ListingItemImage from "./listing-item-image";
import ListingItemImagesModal from "./listing-item-images-modal";
import { Button } from "@/components/ui/button";

export default function ListingItemImages({
  enableUpload,
  listingImages,
  isLoading,
  isUploading,
  fetchListingImages,
  handleImagesUpload,
  deleteListingImage,
}: {
  enableUpload: boolean;
  listingImages: string[];
  isLoading: boolean;
  isUploading: boolean;
  fetchListingImages: () => Promise<void>;
  handleImagesUpload: (base64s: string[]) => Promise<void>;
  deleteListingImage: (url: string) => Promise<void>;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const renderEmptyImagePlaceholder = (index: number) => {
    return (
      <div
        key={index}
        className="rounded-xl flex items-center justify-center border border-dashed border-[#9E9E9E] h-[126px]"
      >
        <PhotoIcon className="w-8 h-8" color="#9E9E9E" />
      </div>
    );
  };

  useEffect(() => {
    fetchListingImages();
  }, [fetchListingImages]);

  const shouldShowUploader = listingImages.length < 5;
  const displayedImages = listingImages.slice(0, 4);
  const placeholdersNeeded = 4 - listingImages.length;

  return (
    <>
      <div className="space-y-4">
        {listingImages.length >= 5 && enableUpload && (
          <div className="flex items-center justify-end">
            <Button
              className="bg-[#7747FF] hover:bg-[#6A3FE6] text-white rounded-full px-4 py-2 text-sm min-w-[184px]"
              onClick={() => setModalOpen(true)}
            >
              <CameraIcon className="w-4 h-4" />
              Add more
            </Button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shouldShowUploader && !isLoading ? (
            <ImageUploader
              isLoading={isUploading}
              onChange={handleImagesUpload}
            />
          ) : isLoading ? (
            <div className="animate-pulse rounded-xl bg-gray-200 min-h-[276px] w-full" />
          ) : (
            <div className="relative rounded-xl h-[276px]">
              <Image
                src={listingImages[4]}
                alt={`cover-image`}
                fill
                className="object-cover rounded-xl"
              />

              <Button
                type="button"
                className="z-10 bg-[#F0F0FE] hover:bg-[#F0F0FE] rounded-full text-[#26045D] absolute bottom-5 right-5"
                onClick={() => setModalOpen(true)}
              >
                <PhotoIcon className="w-4 h-4" />
                See all
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl bg-gray-200 h-[126px] w-full"
                />
              ))
            ) : (
              <>
                {displayedImages.map((src, index) => (
                  <ListingItemImage
                    key={index}
                    url={src}
                    showDeleteButton={shouldShowUploader}
                    deleteListingImage={deleteListingImage}
                  />
                ))}
                {/* Only show placeholders if uploader is shown */}
                {shouldShowUploader &&
                  Array.from({ length: placeholdersNeeded }).map((_, i) =>
                    renderEmptyImagePlaceholder(i),
                  )}
              </>
            )}
          </div>
        </div>
      </div>
      <ListingItemImagesModal
        enableUpload={enableUpload}
        open={modalOpen}
        handleOpenChange={setModalOpen}
        listingImages={listingImages}
        handleImagesUpload={handleImagesUpload}
        deleteListingImage={deleteListingImage}
      />
    </>
  );
}
