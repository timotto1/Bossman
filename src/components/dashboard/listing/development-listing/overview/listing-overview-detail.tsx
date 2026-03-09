import ListingDetailCard from "./listing-detail-card";
import ListingDevelopmentDetailCard from "./listing-development-detail-card";
import ListingEligibilityCard from "./listing-eligibility-card";

export default function ListingOverviewDetail() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ListingDetailCard />
      <ListingDevelopmentDetailCard />
      <ListingEligibilityCard />
    </div>
  );
}
