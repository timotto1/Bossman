"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useParams } from "next/navigation";

import { MainTabs } from "../main-tabs";
import EnquiryItemDetailsPage from "./details/enquiry-item-details-page";
import EnquiryItemOverviewPage from "./overview/enquiry-item-overview-page";

export default function EnquiryItemPage() {
  const params = useParams();

  function renderContent(tab: string) {
    switch (tab) {
      case "overview":
        return <EnquiryItemOverviewPage />;
      case "details":
        return <EnquiryItemDetailsPage />;
      default:
        return <div>Not Found</div>;
    }
  }

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      href: `/dashboard/enquiries/${params?.id}?t=overview`,
    },
    {
      value: "details",
      label: "Details",
      href: `/dashboard/enquiries/${params?.id}?t=details`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="py-8 px-5 pb-0 flex flex-row items-center gap-5">
        <Link
          className="bg-transparent hover:bg-transparent"
          href="/dashboard/enquiries"
        >
          <ArrowLeftIcon className="w-5 h-5" color="#26045D" />
        </Link>
        <div className="flex items-center gap-6 text-[#26045D]">
          <h1 className="font-medium text-[24px] text-[#26045D]">
            Hinel Karimi
          </h1>
          <div className="flex items-center gap-2 bg-[#E5DAFB] text-[#7114E2] px-3 py-1 rounded-full">
            Eligible
          </div>
        </div>
      </div>
      <MainTabs
        tabs={tabs}
        defaultTab={"overview"}
        renderContent={renderContent}
      />
    </div>
  );
}
