import ListingItemImages from "../../listing-item-images";
import UnitListingDescriptionCard from "./unit-listing-description-card";
import UnitListingVideosCard from "./unit-listing-videos-card";
import { useUnitListing } from "@/context/unit-listing-context";

export default function UnitListingMarketingPage() {
  const {
    isImagesLoading,
    isImageUploading,
    listingImages,
    fetchListingImages,
    handleImagesUpload,
    deleteListingImage,
  } = useUnitListing();

  return (
    <div className="px-5 py-4 space-y-6">
      <ListingItemImages
        isLoading={isImagesLoading}
        isUploading={isImageUploading}
        enableUpload={true}
        listingImages={listingImages}
        deleteListingImage={deleteListingImage}
        fetchListingImages={fetchListingImages}
        handleImagesUpload={handleImagesUpload}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UnitListingVideosCard />
        <UnitListingDescriptionCard />
      </div>
    </div>
  );
}
