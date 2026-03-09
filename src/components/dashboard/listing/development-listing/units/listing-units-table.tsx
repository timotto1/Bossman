// ListingUnitsTable.tsx
import { forwardRef, useEffect, useImperativeHandle } from "react";

import { unitListingColumns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { useDevelopmentListing } from "@/context/development-listing-context";
import { UnitListing } from "@/types/types";

// Wrap component with forwardRef
const ListingUnitsTable = forwardRef(function ListingUnitsTable(
  {
    onSelectionChange,
  }: { onSelectionChange?: (selected: UnitListing[]) => void },
  ref,
) {
  const {
    isUnitsLoading: isLoading,
    fetchListingUnits,
    listingUnits,
  } = useDevelopmentListing();

  useEffect(() => {
    fetchListingUnits();
  }, [fetchListingUnits]);

  // ✅ Expose the refresh method to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchListingUnits,
  }));

  return (
    <Card className="rounded-[12px] border-[#EEEEEE] bg-white">
      <CardContent className="p-4 relative">
        <DataTable
          showTotal={false}
          showSearchFilter={true}
          showExport={true}
          showColumnToggle={false}
          columns={unitListingColumns}
          data={listingUnits}
          isLoading={isLoading}
          onSelectionChange={onSelectionChange}
          title={
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-[#26045D]">Units</h2>
              <div className="bg-[#F4F0FE] py-[2px] px-2 text-xs text-[#AE78F1] max-w-fit rounded-full">
                {listingUnits.length} unit
                {listingUnits.length > 1 ? "s" : ""}
              </div>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
});

export default ListingUnitsTable;
