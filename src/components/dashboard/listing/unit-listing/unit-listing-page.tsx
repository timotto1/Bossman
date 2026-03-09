"use client";

import { useParams } from "next/navigation";

import { MainTabs } from "../../main-tabs";
import UnitListingAttachmentsPage from "./attachments/unit-listing-attachments-page";
import UnitListingMarketingPage from "./marketing/unit-listing-marketing-page";
import UnitListingOverviewPage from "./overview/unit-listing-overview-page";
import UnitListingHeader from "./unit-listing-header";

export default function UnitListingPage() {
  const params = useParams();

  function renderContent(tab: string) {
    switch (tab) {
      case "overview":
        return <UnitListingOverviewPage />;
      case "marketing":
        return <UnitListingMarketingPage />;
      case "attachments":
        return <UnitListingAttachmentsPage />;
      default:
        return <div>Not Found</div>;
    }
  }

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      href: `/dashboard/listing/${params?.id}/unit/${params?.unitId}?t=overview`,
    },
    {
      value: "marketing",
      label: "Marketing",
      href: `/dashboard/listing/${params.id}/unit/${params?.unitId}?t=marketing`,
    },
    {
      value: "attachments",
      label: "Attachments",
      href: `/dashboard/listing/${params.id}/unit/${params?.unitId}?t=attachments`,
    },
  ];

  return (
    <div className="space-y-6">
      <UnitListingHeader />

      <MainTabs
        tabs={tabs}
        defaultTab={"overview"}
        renderContent={renderContent}
      />
    </div>
  );
}
