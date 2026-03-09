import UnitListingDetailCard from "./unit-listing-detail-card";
import UnitListingDevelopmentDetailCard from "./unit-listing-development-detail-card";
import UnitListingEligibilityCard from "./unit-listing-eligibility-card";

export default function UnitListingOverviewDetail() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UnitListingDetailCard />
      <UnitListingDevelopmentDetailCard />
      <UnitListingEligibilityCard />
    </div>
  );
}
