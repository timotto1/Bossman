"use client";

import { useSearchParams } from "next/navigation";

// import AllListingsTable from "./all-listings-table";
import DraftListingsTable from "./draft-listings-table";
import { ListingPipelineChart } from "./listing-pipeline-chart";
import LiveListingsTable from "./live-listings-table";
import UnlistedListingsTable from "./unlisted-listings-table";

export function ListingsTable() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  const renderListingsTable = () => {
    switch (filter) {
      // case "draft":
      //   return <DraftListingsTable />;
      case "unlisted":
        return <UnlistedListingsTable />;
      case "live":
        return <LiveListingsTable />;
      case "sales_pipeline":
        return <ListingPipelineChart />;
      default:
        return <DraftListingsTable />;
    }
  };

  return renderListingsTable();
}
