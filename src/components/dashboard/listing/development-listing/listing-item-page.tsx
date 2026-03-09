"use client";

import { useParams } from "next/navigation";

import ListingAttachmentsPage from "./attachments/listing-attachments-page";
import ListingEnquiriesPage from "./enquiries/listing-enquiries-page";
import ListingItemHeader from "./listing-item-header";
import ListingMarketingPage from "./marketing/listing-marketing-page";
import ListingOverviewPage from "./overview/listing-overview-page";
import ListingUnitsPage from "./units/listing-units-page";
import { MainTabs } from "@/components/dashboard/main-tabs";

export default function DevelopmentListingPage() {
  const params = useParams();

  function renderContent(tab: string) {
    switch (tab) {
      case "overview":
        return <ListingOverviewPage />;
      case "units":
        return <ListingUnitsPage />;
      case "marketing":
        return <ListingMarketingPage />;
      case "attachments":
        return <ListingAttachmentsPage />;
      case "enquiries":
        return <ListingEnquiriesPage />;
      default:
        return <div>Not Found</div>;
    }
  }

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      href: `/dashboard/listing/${params?.id}?t=overview`,
    },
    {
      value: "units",
      label: "Units",
      href: `/dashboard/listing/${params?.id}?t=units`,
    },
    {
      value: "marketing",
      label: "Marketing",
      href: `/dashboard/listing/${params.id}?t=marketing`,
    },
    {
      value: "attachments",
      label: "Attachments",
      href: `/dashboard/listing/${params.id}?t=attachments`,
    },
    {
      value: "enquiries",
      label: "Enquiries",
      href: `/dashboard/listing/${params.id}?t=enquiries`,
    },
  ];

  return (
    <div className="space-y-6">
      <ListingItemHeader />

      <MainTabs
        tabs={tabs}
        defaultTab={"overview"}
        renderContent={renderContent}
      />
    </div>
  );
}
