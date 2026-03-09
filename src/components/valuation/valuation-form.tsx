"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { CustomPagination as Pagination } from "../custom-pagination";
import { Skeleton } from "../ui/skeleton";
import ValuationConfirmation from "./valuation-confirm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/use-pagination";
import { createClient } from "@/utils/supabase/client";

interface Unit {
  id: string;
  address_1: string;
  address_2: string;
  address_3: string;
  city: string;
  county: string;
  development_id: string;
  stairpay_unit_id: string;
  monthly_rent: number;
  postcode: string;
  purchase_date: string;
  purchase_price: number;
  region: string;
  specified_rent: number;
  status: string;
  unit_type: string;
}

export default function ValuationForm({
  generateAllUnits = false,
}: {
  generateAllUnits?: boolean;
}) {
  const supabase = createClient();

  const { id } = useParams();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedUnits, setGeneratedUnits] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [multipleStatements, setMultipleStatements] = useState(false);
  const [allLeaseUnits, setAllLeaseUnits] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [unit, setUnit] = useState<Unit | null>(null);

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
      .filter((part) => part && part.trim() !== "")
      .join(", ");
  }, []);

  const getAllUnits = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const companyID = user?.user_metadata?.company;

      const { data: developmentsData, error: developmentsDataError } =
        await supabase
          .from("company_development")
          .select("id")
          .eq("company_id", companyID);

      if (developmentsDataError) throw new Error(developmentsDataError.message);

      const { data: unitsData, error: unitsDataError } = await supabase
        .from("company_development_units")
        .select("*")
        .in(
          "development_id",
          developmentsData.map((data) => data.id),
        )
        .eq("lease_type", "2021_2026");

      if (unitsDataError) throw new Error(unitsDataError.message);

      setAllUnits(unitsData);
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const getUnit = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("company_development_units")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      setUnit(data);
      await getAllUnits();
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, id, getAllUnits]);

  useEffect(() => {
    if (generateAllUnits) {
      getAllUnits();
    } else {
      getUnit();
    }
  }, [getUnit, getAllUnits, generateAllUnits]);

  const filteredUnits = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return allUnits.filter(
      (unit) =>
        (unit.address_1?.toLowerCase() || "").includes(lowerCaseQuery) ||
        (unit.address_2?.toLowerCase() || "").includes(lowerCaseQuery) ||
        (unit.address_3?.toLowerCase() || "").includes(lowerCaseQuery) ||
        (unit.postcode?.toLowerCase() || "").includes(lowerCaseQuery) ||
        (unit.city?.toLowerCase() || "").includes(lowerCaseQuery),
    );
  }, [searchQuery, allUnits]);

  const handleCheckboxChange = useCallback((unitId: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId],
    );
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleContinue = useCallback(() => {
    if (multipleStatements) {
      if (allLeaseUnits) {
        setGeneratedUnits(allUnits.map((unit) => unit.id));
      } else {
        setGeneratedUnits(selectedUnits);
      }
    } else {
      setGeneratedUnits(
        generateAllUnits ? allUnits.map((unit) => unit.id) : [id as string],
      );
    }
    setShowConfirmation(true);
  }, [
    //router,
    id,
    multipleStatements,
    allLeaseUnits,
    selectedUnits,
    allUnits,
    generateAllUnits,
  ]);

  const renderStatusBadge = useCallback((status: string) => {
    const statusStyles =
      status === "occupied"
        ? "bg-[#00C875] text-white"
        : "bg-gray-300 text-black";
    return (
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles}`}
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

  if (showConfirmation)
    return (
      <ValuationConfirmation
        generatedUnits={generatedUnits}
        handleBack={() => setShowConfirmation(false)}
      />
    );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full border max-w-fit">
        <h2 className="text-2xl font-bold text-[#26045D] mb-2">
          Create an HPI valuation statement?
        </h2>

        {isLoading ? (
          <Skeleton className="w-full h-4 rounded-full" />
        ) : (
          <>
            {!generateAllUnits && (
              <>
                <p className="text-sm font-normal text-gray-600 mb-6">
                  You are about to create a valuation statement for:
                </p>

                <p className="text-lg font-bold text-[#26045D] mb-8">
                  {unit ? getUnitAddress(unit) : ""}
                </p>
              </>
            )}

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Would you like to create multiple statements at once?
              </p>
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => setMultipleStatements(true)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium ${
                    multipleStatements
                      ? "bg-[#26045D] text-white border-[#26045D]"
                      : "border-gray-300 text-gray-600 bg-white hover:bg-white"
                  }`}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  onClick={() => setMultipleStatements(false)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium ${
                    !multipleStatements
                      ? "bg-[#26045D] text-white border-[#26045D]"
                      : "border-gray-300 text-gray-600 bg-white hover:bg-white"
                  }`}
                >
                  No
                </Button>
              </div>
            </div>

            {multipleStatements && (
              <div className="mb-8">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Would you like to create a statement for all 2021-2026 lease
                  units?
                </p>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setAllLeaseUnits(true)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium ${
                      allLeaseUnits
                        ? "bg-[#26045D] text-white border-[#26045D]"
                        : "border-gray-300 text-gray-600 bg-white hover:bg-white"
                    }`}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setAllLeaseUnits(false)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium ${
                      !allLeaseUnits
                        ? "bg-[#26045D] text-white border-[#26045D]"
                        : "border-gray-300 text-gray-600 bg-white hover:bg-white"
                    }`}
                  >
                    No
                  </Button>
                </div>
              </div>
            )}

            {multipleStatements && !allLeaseUnits && (
              <>
                <div className={`${selectedUnits.length === 0 ? "mb-8" : ""}`}>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Select units
                  </p>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search for specific units"
                    className="w-full mb-4 border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <div className="overflow-x-auto border border-gray-200 rounded-lg max-w-2xl min-w-2xl mx-auto mb-4">
                    <Table className="table-fixed w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">
                            <input
                              type="select"
                              onChange={(e) =>
                                setSelectedUnits(
                                  e.target.checked
                                    ? filteredUnits.map((unit) => unit.id)
                                    : [],
                                )
                              }
                              checked={
                                selectedUnits.length === filteredUnits.length &&
                                filteredUnits.length > 0
                              }
                            />
                          </TableHead>
                          <TableHead className="w-32">Unit ID</TableHead>
                          <TableHead className="w-64">Address</TableHead>
                          <TableHead className="w-32">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentItems.length > 0 ? (
                          currentItems.map((unit) => (
                            <TableRow key={unit.id}>
                              <TableCell className="w-16">
                                <input
                                  type="checkbox"
                                  checked={selectedUnits.includes(unit.id)}
                                  onChange={() => handleCheckboxChange(unit.id)}
                                />
                              </TableCell>
                              <TableCell className="w-32">{unit.id}</TableCell>
                              <TableCell className="w-64">
                                {getUnitAddress(unit)}
                              </TableCell>
                              <TableCell className="w-32">
                                {renderStatusBadge(unit.status)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4">
                              No data available
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
                <p className="text-sm font-medium text-[#26045D] mb-4 mt-2">
                  You will create the valuation report for
                  <span className="font-bold"> {selectedUnits.length} </span>
                  selected unit{selectedUnits.length === 1 ? "" : "s"}.
                </p>
              </>
            )}

            <div className="flex justify-center mt-6">
              <Button
                disabled={
                  multipleStatements && !allLeaseUnits && !selectedUnits.length
                }
                onClick={handleContinue}
                className="bg-[#26045D] hover:bg-[#1f034d] text-white w-5/12 py-3 rounded-full text-sm font-bold"
              >
                Continue
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
