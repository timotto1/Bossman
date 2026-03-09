"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

import { CustomPagination as Pagination } from "../../../custom-pagination";
import { Checkbox } from "../../../ui/checkbox";
import { Input } from "../../../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { Unit } from "@/types/types";
import { createClient } from "@/utils/supabase/client";

type Props = {
  selected: number;
  onSelectUnit: (unitID: number) => void;
  developmentID: number;
};

export default function UnitLookupField({
  selected,
  developmentID,
  onSelectUnit,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);

  const getUnitAddress = useCallback((unit: Unit) => {
    const {
      address_1 = "",
      address_2 = "",
      address_3 = "",
      city = "",
      county = "",
      postcode = "",
    } = unit;

    return [address_1, address_2, address_3, city, county, postcode]
      .filter(Boolean)
      .join(", ");
  }, []);

  const getUnits = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(`get_units_without_listings`, {
        development_id: developmentID,
      });

      if (error) throw new Error(error.message);

      setUnits(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [developmentID]);

  const filteredUnits = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return units.filter((unit) =>
      (unit.postcode?.split(" ").join("").toLowerCase() || "").includes(
        lowerCaseQuery,
      ),
    );
  }, [searchQuery, units]);

  const renderStatusBadge = useCallback((status: string) => {
    return (
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full bg-[#E5DAFB] text-[#AE78F1]`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }, []);

  const {
    currentPage,
    totalPages,
    currentItems,
    handleClick,
    handlePrevious,
    handleNext,
  } = usePagination({
    items: filteredUnits,
    itemsPerPage: 10,
  });

  useEffect(() => {
    if (developmentID) {
      getUnits();
    }
  }, [getUnits, developmentID]);

  if (loading)
    return (
      <div className="h-28 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="relative w-full">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type post code"
          className="pr-10 w-full border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Image
          src="/images/arrow-down.png"
          className="absolute right-3 top-1/2 -translate-y-1/2"
          width={20}
          height={20}
          alt="arrow-down"
        />
      </div>

      <div className="overflow-x-auto w-full mx-auto mb-4">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-[#F0F0FE]">
            <TableRow>
              <TableHead className="w-4" />
              <TableHead className="font-medium text-[#26045D] text-center">
                Unit ID
              </TableHead>
              <TableHead className="w-64 font-medium text-[#26045D] text-center">
                Address Line 1
              </TableHead>
              <TableHead className="font-medium text-[#26045D] text-center">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.length ? (
              currentItems.map((unit) => {
                const isSelected = selected.toString() === unit.id.toString();
                return (
                  <TableRow
                    key={unit.id}
                    className={cn(
                      "cursor-pointer",
                      isSelected && "bg-[#F0F0FE]",
                    )}
                  >
                    <TableCell className="w-4 text-center align-middle">
                      <Checkbox
                        className="data-[state=checked]:bg-[#26045D] border-[#26045D]"
                        checked={isSelected}
                        onCheckedChange={() => {
                          onSelectUnit(unit.id);
                        }}
                        aria-label="Select row"
                      />
                    </TableCell>
                    <TableCell className="truncate whitespace-nowrap text-ellipsis overflow-hidden text-center">
                      {unit.internal_id || unit.id}
                    </TableCell>
                    <TableCell className="w-64 overflow-hidden line-clamp-3">
                      {getUnitAddress(unit)}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderStatusBadge(unit.status)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No units available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handleClick}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
