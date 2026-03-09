/*eslint-disable @typescript-eslint/no-explicit-any*/

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetchHousePriceIndex = async () => {
  const sparql_query = `
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix owl: <http://www.w3.org/2002/07/owl#>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>
prefix sr: <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/>
prefix ukhpi: <http://landregistry.data.gov.uk/def/ukhpi/>
prefix lrppi: <http://landregistry.data.gov.uk/def/ppi/>
prefix skos: <http://www.w3.org/2004/02/skos/core#>
prefix lrcommon: <http://landregistry.data.gov.uk/def/common/>

# House price index for all regions within a given date range
SELECT ?region ?date ?hpi ?hpiFlatMaisonette ?hpiSemiDetached ?hpiDetached ?hpiTerraced
{
    ?record ukhpi:refPeriodStart ?date ;
            ukhpi:housePriceIndex ?hpi ;
            ukhpi:refRegion ?region .
    OPTIONAL { ?record ukhpi:housePriceIndexFlatMaisonette ?hpiFlatMaisonette }
    OPTIONAL { ?record ukhpi:housePriceIndexSemiDetached ?hpiSemiDetached }
    OPTIONAL { ?record ukhpi:housePriceIndexDetached ?hpiDetached }
    OPTIONAL { ?record ukhpi:housePriceIndexTerraced ?hpiTerraced }
}
`;
  const params = new URLSearchParams({
    query: sparql_query,
  });

  const response = await fetch(
    `https://landregistry.data.gov.uk/landregistry/query?${params}`,
    {
      headers: {
        accept: "application/sparql-results+json",
      },
    },
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }

  try {
    return parseHPIResults(await response.json());
  } catch (err) {
    throw new Error((err as Error).message);
  }
};

const parseHPIResults = (data: any) => {
  const array: any[] = [];

  const sortedByLatestDate = data.results.bindings.sort((a: any, b: any) => {
    const dateA = new Date(a.date.value);
    const dateB = new Date(b.date.value);
    return dateB.getTime() - dateA.getTime(); // Descending order
  });

  for (const row of sortedByLatestDate) {
    const region = row.region.value.split("/").pop() as string;
    const date = row.date.value;

    array.push({
      region,
      for_month: date,
      index_value: string_float_to_db_int(row.hpi.value) as number,
      index_value_flat_maisonette: string_float_to_db_int(
        row.hpiFlatMaisonette?.value,
      ),
      index_value_semi_detached: string_float_to_db_int(
        row.hpiSemiDetached?.value,
      ),
      index_value_detached: string_float_to_db_int(row.hpiDetached?.value),
      index_value_terraced: string_float_to_db_int(row.hpiTerraced?.value),
    });
  }

  return array;
};

const string_float_to_db_int = (value?: string) => {
  if (!value) {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed * 100;
};

export const getBucket = (bucket: string) => {
  const bucketKey = bucket?.trim();

  const bucketConfig: Record<string, { label: string; color: string }> = {
    mortgage_expiry: { label: "Mortgage expiry", color: "#F5AB47" },
    ready_to_transact: { label: "Ready to transact", color: "#0FB872" },
    transacting: { label: "Transacting", color: "#A486F7" },
    education_phase: { label: "Education Phase", color: "#7114E2" },
    // Uncomment if needed:
    // financial_difficulty: { label: "Financial difficulty", color: "#D61F56" },
  };

  const currentBucket = bucketConfig[bucketKey || ""];

  return (
    <div
      key={bucket}
      className="flex items-center gap-2 text-xs font-normal leading-4 text-center text-[#26045D] justify-center"
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: currentBucket?.color || "#A9A9A9" }}
      />
      {currentBucket?.label || "No status"}
    </div>
  );
};

export const getTransactionStatus = (status: string) => {
  const statusConfig: Record<
    string,
    { label: string; color: string; bgColor: string }
  > = {
    started: { label: "Started", color: "#F5AB47", bgColor: "#FDF4E4" },
    submitted: { label: "Submitted", color: "#6898F4", bgColor: "#E8F0FD" },
    in_review: { label: "In Review", color: "#F4C542", bgColor: "#FEF8E4" },
    mos_generated: {
      label: "MOS Generated",
      color: "#6EC1E4",
      bgColor: "#E7F6FB",
    },
    pending_legals: {
      label: "Pending Legals",
      color: "#E46EC1",
      bgColor: "#FAE8F3",
    },
    exchanged: { label: "Exchanged", color: "#4CAF50", bgColor: "#E6F4E7" },
    completed: { label: "Completed", color: "#9C27B0", bgColor: "#F5E6F7" },
  };

  const currentStatus = statusConfig[status];

  return (
    <div
      key={status}
      className={`
        max-w-fit rounded-full py-[2px] px-2 
        bg-[${currentStatus?.bgColor}] text-xs 
        text-[${currentStatus?.color}] 
      `}
      style={{
        backgroundColor: currentStatus?.bgColor || "#F0F1F4",
        color: currentStatus?.color || "#535862",
      }}
    >
      {currentStatus?.label || "No status"}
    </div>
  );
};

export const getListingStatusMapping = (status: string) => {
  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: "Draft", color: "#7114E2" },
    available: { label: "Published", color: "#28A745" },
    off_market: { label: "Unlisted", color: "#DC3545" },
    sold: { label: "Sold", color: "#4B0082" },
    removed: { label: "Removed", color: "#000000" },
  };

  return statusConfig[status] || { label: "Draft", color: "#B0B0B0" };
};

export const getListingStatus = (status: string, className = "") => {
  const currentStatus = getListingStatusMapping(status);

  return (
    <div
      key={status}
      className={cn(
        "flex items-center gap-2 text-xs font-normal leading-4 text-left text-[#26045D] justify-center",
        className,
      )}
    >
      {currentStatus?.label || "No status"}
    </div>
  );
};
