import ListingItemImages from "../../listing-item-images";
import ListingDescriptionCard from "./listing-description-card";
import ListingVideosCard from "./listing-videos-card";
import { useDevelopmentListing } from "@/context/development-listing-context";

export default function ListingMarketingPage() {
  const {
    isImagesLoading,
    isImageUploading,
    listingImages,
    fetchListingImages,
    handleImagesUpload,
    deleteListingImage,
  } = useDevelopmentListing();

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
        <ListingVideosCard />
        <ListingDescriptionCard />
      </div>
    </div>
  );
}
