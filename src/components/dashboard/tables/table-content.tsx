"use client";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { TabsList } from "@radix-ui/react-tabs";
import { Edit2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import CreateTableDialog from "./create-table-dialog";
import DeleteTableButton from "./delete-table-button";
import EditTableButton from "./edit-table-button";
import { Loader } from "@/components/loader";
import { MyDataTable } from "@/components/table/my-data-table";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { TableQuery, useTable } from "@/context/table-context";
import { useUser } from "@/context/user-context";

export default function TableContent() {
  const { user } = useUser();

  const {
    initializing,
    loading,
    contentLoading,
    tables,
    tableData,
    tableColumns,
    selectedTable,
    getTableData,
    setSelectedTable,
  } = useTable();

  const canEditTable = (query: TableQuery) => {
    return (
      query.created_by === user?.id ||
      query.edit_permission_type === "all" ||
      (query.edit_permission_type === "user" &&
        query.edit_permission_user_id === user?.id)
    );
  };

  const renderLoadingSkeletons = () =>
    [...Array(3)].map((_, index) => (
      <CarouselItem key={index} className="mt-2 basis-1/3">
        <div className="w-full relative p-4 border border-[#EEEEEE] rounded-2xl h-[280px] flex flex-col gap-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-[24px] w-24 rounded-full" />
              <Skeleton className="h-[12px] w-16" />
            </div>
            <Skeleton className="h-[24px] w-16 rounded-full" />
          </div>
          <div className="flex-1 px-8 flex flex-col justify-center gap-2">
            <Skeleton className="h-[20px] w-32" />
            <Skeleton className="h-[16px] w-full" />
            <Skeleton className="h-[16px] w-3/4" />
          </div>
          <div className="flex justify-end gap-2">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>
      </CarouselItem>
    ));

  const renderTableQueryItem = (query: TableQuery, index: number) => (
    <CarouselItem key={query.id} className="mt-2 basis-1/2 md:basis-1/3">
      <TabsTrigger asChild value={query.id} className="rounded-[12px]">
        <div className="cursor-pointer w-full relative p-4 border border-[#EEEEEE] data-[state=active]:border-2 data-[state=active]:border-[#7114E2] h-[240px] mt-4">
          {index === 0 && (
            <div className="absolute top-[-10px] right-[-10px] h-6 w-6 bg-[#8332E5] rounded-full flex items-center justify-center">
              <SparklesIcon className="h-[18px] w-[18px] text-white" />
            </div>
          )}
          <div className="h-full w-full p-0 flex flex-col gap-2">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col lg:flex-row lg:items-center gap-1">
                <div className="h-[24px] bg-[#89F5C8] px-2 py-1 rounded-full w-fit">
                  <p className="text-[10px] font-medium text-[#215942]">
                    {`${query.case_managers.first_name} ${query.case_managers.last_name}`}
                  </p>
                </div>
                <p className="text-[10px] text-[#D6D5D7] font-medium text-left lg:text-center">
                  {new Date(query.created_at).toLocaleDateString("en-GB")}
                </p>
              </div>
              <div className="w-fit h-[24px] border border-[#D6D5D7] rounded-full px-3 py-1 flex items-center gap-1">
                <Image
                  src="/images/user-circle-mini.png"
                  width={20}
                  height={20}
                  alt="user circle"
                />
                <p className="text-sm text-[#26045D]">{query.resident_count}</p>
              </div>
            </div>
            <div className="flex-1 px-8 flex flex-col justify-center">
              <h3 className="font-medium text-base text-[#26045D] truncate text-left">
                {query.name}
              </h3>
              <p className="text-sm truncate text-left break-all">
                {query.description}
              </p>
            </div>
            {canEditTable(query) && (
              <div className="flex items-center gap-2 justify-end">
                <EditTableButton query={query} />
                <DeleteTableButton query={query} />
              </div>
            )}
          </div>
        </div>
      </TabsTrigger>
    </CarouselItem>
  );

  if (initializing)
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader />
      </div>
    );

  if (!tables.length) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center gap-1">
        <h3 className="font-medium text-[18px] text-[#26045D]">No Tables</h3>
        <p className="text-[14px] text-[#B9B7BD]">
          Create a table to get started
        </p>
        <CreateTableDialog />
      </div>
    );
  }

  return (
    <>
      <Tabs
        defaultValue={tables?.[0]?.id}
        value={selectedTable}
        onValueChange={async (id) => {
          setSelectedTable(id);
          await getTableData(tables.find((query) => query.id === id)!);
        }}
      >
        <TabsList className="bg-transparent">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {loading && renderLoadingSkeletons()}
              {!loading && tables.map(renderTableQueryItem)}
            </CarouselContent>
            {!loading && tables.length > 3 && (
              <>
                <CarouselPrevious className="left-[-10px]" />
                <CarouselNext className="right-[-10px]" />
              </>
            )}
          </Carousel>
        </TabsList>
        {tables.map((query) => (
          <TabsContent
            key={query.id}
            value={query.id}
            className="mt-[30px] shadow-[0px_2px_10px_0px_#0000001A] rounded-[12px] overflow-x-hidden overflow-y-auto py-6 px-2"
          >
            <MyDataTable
              showColumnToggle={true}
              showExport={true}
              exportCSVFileName={`${query.name}.csv`}
              columns={[
                ...(tableColumns.map((column) => ({
                  accessorKey: column.field,
                  header: column.label,
                  enableSorting: column.type === "checkbox" ? false : true,
                  /*eslint-disable @typescript-eslint/no-explicit-any*/
                  cell: ({ row }: any) => {
                    const data = row.original as any;

                    if (column.type === "checkbox") {
                      return (
                        <Checkbox
                          className="data-[state=checked]:bg-[#26045D] border-[#26045D]"
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) =>
                            row.toggleSelected(!!value)
                          }
                          aria-label="Select row"
                        />
                      );
                    }

                    if (column.type === "date") {
                      return (
                        <p className="text-center">
                          {new Date(data[column.field])
                            .toLocaleDateString("en-GB")
                            .replaceAll("/", "-")}
                        </p>
                      );
                    }

                    if (column.type === "number") {
                      return (
                        <p className="text-center">
                          {(data[column.field] || 0).toLocaleString("en-GB", {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      );
                    }

                    if (column.type === "boolean") {
                      return (
                        <p className="text-center">
                          {String(data[column.field])}
                        </p>
                      );
                    }

                    if (column.type === "actions") {
                      return (
                        <Link
                          href={`/dashboard/lead/${row.original.resident_id}`}
                          className="text-center"
                        >
                          <Edit2
                            width={16}
                            height={16}
                            color="#535862"
                            className="cursor-pointer"
                          />
                        </Link>
                      );
                    }

                    return <p className="text-center">{data[column.field]}</p>;
                  },
                })) as any),
              ]}
              isLoading={contentLoading}
              data={tableData}
              title={
                <div className="flex items-center gap-2 px-4">
                  <h2 className="text-lg font-medium text-[#26045D]">
                    {query.name}
                  </h2>
                  <div className="bg-[#F4F0FE] py-[2px] px-2 text-xs text-[#AE78F1] max-w-fit rounded-full">
                    <p className="text-[#AE78F1] text-[12px]">{`${query.resident_count} residents`}</p>
                  </div>
                </div>
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
