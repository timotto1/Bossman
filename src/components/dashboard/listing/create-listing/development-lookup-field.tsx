"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../../../ui/command";
import { Input } from "../../../ui/input";
import { CreateListingFormData } from "./create-listing-form";
import { useUser } from "@/context/user-context";
import useDebounce from "@/hooks/use-debounce";
import { Development } from "@/types/types";
import { createClient } from "@/utils/supabase/client";

export default function DevelopmentLookupField() {
  const { user } = useUser();
  const supabase = createClient();

  const form = useFormContext<CreateListingFormData>();

  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [predictions, setPredictions] = useState<Development[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
    }
  };

  const getDevelopments = useCallback(
    async (searchKey: string) => {
      setLoading(true);
      try {
        const scope = form.watch("initialForm.scope");

        const { data: listings, error: listError } = await supabase
          .from("development_listings")
          .select("company_development_id");

        if (listError) throw new Error(listError.message);

        const ids = listings.map((listing) => listing.company_development_id);

        let query = supabase
          .from("company_development")
          .select("*")
          .ilike("name", `%${searchKey}%`)
          .eq("company_id", user?.companyID);

        if (ids.length && scope === "development") {
          query = query.not("id", "in", `(${ids.join(",")})`);
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);

        setPredictions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [user?.companyID, form, supabase],
  );

  const debounceSearchInput = useDebounce(searchInput, 500);

  useLayoutEffect(() => {
    if (debounceSearchInput) {
      getDevelopments(debounceSearchInput);
    }
  }, [debounceSearchInput, getDevelopments]);

  return (
    <>
      <Command
        shouldFilter={false}
        onKeyDown={handleKeyDown}
        className="overflow-visible"
      >
        <div className="flex w-full flex-col items-center justify-between rounded-lg border bg-background ring-offset-background text-sm">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Development name"
              className="pr-10 border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  form.setValue("initialForm.developmentID", undefined);
                } else {
                  open();
                }
              }}
              onBlur={close}
              onFocus={open}
            />
            <Image
              src="/images/arrow-down.png"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              width={20}
              height={20}
              alt="arrow-down"
            />
          </div>
          {isOpen && searchInput && (
            <div className="relative animate-in fade-in-0 zoom-in-95 w-full">
              <CommandList>
                <div className="absolute top-1.5 z-50 w-full">
                  <CommandGroup className="relative z-50 overflow-hidden rounded-md border shadow-md bg-background max-h-64 overflow-y-auto scrollbar-thin">
                    {loading ? (
                      <div className="h-28 flex items-center justify-center">
                        <Loader2 className="size-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        {predictions.map((prediction) => (
                          <CommandItem
                            className="hover:cursor-pointer"
                            key={prediction.id}
                            value={prediction.id.toString()}
                            onSelect={async () => {
                              const { data: listing, error: listError } =
                                await supabase
                                  .from("development_listings")
                                  .select("id")
                                  .eq("company_development_id", prediction.id)
                                  .maybeSingle();

                              if (listError) throw new Error(listError.message);

                              form.setValue(
                                "initialForm.developmentListingID",
                                listing?.id,
                              );
                              setSearchInput(prediction.name);
                              form.setValue(
                                "initialForm.developmentID",
                                prediction.id,
                              );
                              setIsOpen(false);
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            <div className="w-full p-2 flex items-center">
                              <div className="flex-1">
                                <h1 className="font-bold text-[#26045D] text-normal">
                                  {prediction.name}
                                </h1>
                              </div>
                              <ChevronRight
                                className="w-4 h-4"
                                color="#26045D"
                              />
                            </div>
                          </CommandItem>
                        ))}
                      </>
                    )}

                    <CommandEmpty>
                      {!loading && !predictions.length && (
                        <div className="py-4 flex items-center justify-center">
                          No developments found
                        </div>
                      )}
                    </CommandEmpty>
                  </CommandGroup>
                </div>
              </CommandList>
            </div>
          )}
        </div>
      </Command>
    </>
  );
}
