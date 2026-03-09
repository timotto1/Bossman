import ListingItemImages from "../../listing-item-images";
import UnitListingOverviewAnalytics from "./unit-listing-overview-analytics";
import UnitListingOverviewDetail from "./unit-listing-overview-detail";
import { useUnitListing } from "@/context/unit-listing-context";

export default function UnitListingOverviewPage() {
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
      <UnitListingOverviewAnalytics />
      <ListingItemImages
        isLoading={isImagesLoading}
        isUploading={isImageUploading}
        enableUpload={false}
        listingImages={listingImages}
        deleteListingImage={deleteListingImage}
        fetchListingImages={fetchListingImages}
        handleImagesUpload={handleImagesUpload}
      />
      <UnitListingOverviewDetail />
    </div>
  );
}
