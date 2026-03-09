import ListingItemImages from "../../listing-item-images";
import ListingOverviewAnalytics from "./listing-overview-analytics";
import ListingOverviewDetail from "./listing-overview-detail";
import { useDevelopmentListing } from "@/context/development-listing-context";

export default function ListingOverviewPage() {
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
      <ListingOverviewAnalytics />
      <ListingItemImages
        isLoading={isImagesLoading}
        isUploading={isImageUploading}
        enableUpload={false}
        listingImages={listingImages}
        fetchListingImages={fetchListingImages}
        handleImagesUpload={handleImagesUpload}
        deleteListingImage={deleteListingImage}
      />
      <ListingOverviewDetail />
    </div>
  );
}
