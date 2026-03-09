"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import {
  DevelopmentListing,
  ListingCompletion,
  UnitListing,
} from "@/types/types";
import { base64ToFile, getImageFileType } from "@/utils";
import {
  getFilenameFromSupabaseUrl,
  getListingImagesFromSupabase,
  uploadingListingsToSupabase,
} from "@/utils/storage";
import { createClient } from "@/utils/supabase/client";

type DevelopmentListingContextType = {
  data: DevelopmentListing | null;
  completion: ListingCompletion | null;
  listingImages: string[];
  listingUnits: UnitListing[];
  isLoading: boolean;
  isUnitsLoading: boolean;
  isImagesLoading: boolean;
  isImageUploading: boolean;
  fetchListingUnits: () => Promise<void>;
  fetchListingImages: () => Promise<void>;
  updateListing: (updates: Partial<DevelopmentListing>) => Promise<void>;
  refreshListing: () => Promise<void>;
  refreshListingUnits: () => Promise<void>;
  refreshListingImages: () => Promise<void>;
  handleImagesUpload: (base64s: string[]) => Promise<void>;
  deleteListingImage: (url: string) => Promise<void>;
};

const DevelopmentListingContext = createContext<
  DevelopmentListingContextType | undefined
>(undefined);

export const useDevelopmentListing = () => {
  const context = useContext(DevelopmentListingContext);
  if (!context) {
    throw new Error("useListing must be used within a ListingProvider");
  }
  return context;
};

export function DevelopmentListingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const params = useParams();

  const { toast } = useToast();

  const [data, setData] = useState<DevelopmentListing | null>(null);
  const [completion, setCompletion] = useState<ListingCompletion | null>(null);
  const [units, setUnits] = useState<UnitListing[]>([]);
  const [listingImages, setListingImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnitsLoading, setIsUnitsLoading] = useState(false);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchListingCompletion = useCallback(
    async (listingID: number) => {
      const { data, error } = await supabase.rpc(
        `get_development_listing_completion`,
        {
          listing_id: listingID,
        },
      );

      if (error) throw new Error(error.message);

      setCompletion(data);
    },
    [supabase],
  );

  const fetchListingImages = useCallback(async () => {
    setIsImagesLoading(true);
    try {
      const urls = await getListingImagesFromSupabase(
        "developments",
        params?.id as string,
      );
      setListingImages(urls);
    } catch (error) {
      console.error(error);
    } finally {
      setIsImagesLoading(false);
    }
  }, [params?.id]);

  const fetchListingUnits = useCallback(async () => {
    setIsUnitsLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("unit_listings")
        .select("*")
        .eq("development_listing_id", params?.id);

      if (error) throw new Error(error.message);

      setUnits(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUnitsLoading(false);
    }
  }, [params.id]);

  const fetchListing = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("development_listings")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (error) throw new Error(error.message);

      await fetchListingCompletion(data?.id);

      setData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id, supabase, fetchListingCompletion]);

  const handleListingImagesUpload = async (base64s: string[]) => {
    setIsUploading(true);
    try {
      const supabase = createClient();
      const uploadPromises = base64s.map(async (base64) => {
        const filename = `${new Date().getTime()}.${getImageFileType(base64)}`;
        const file = base64ToFile(base64, filename);
        const supabasePath = `developments/media/${params.id}/${filename}`;

        const { error } = await supabase
          .from("development_listing_media")
          .insert({
            development_listing_id: params.id,
          });

        if (error) throw new Error(error.message);

        const url = await uploadingListingsToSupabase(supabasePath, file);
        return url; // could be null if upload failed
      });
      await Promise.all(uploadPromises);
      await fetchListingImages();

      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteListingImage = async (url: string) => {
    const supabase = createClient();
    const filename = getFilenameFromSupabaseUrl(url);
    if (filename) {
      await supabase.storage
        .from("listings")
        .remove([`developments/media/${params.id}/${filename}`]);
    }

    await fetchListingImages();
  };

  const updateListing = async (updates: Partial<DevelopmentListing>) => {
    const { error } = await supabase
      .from("development_listings")
      .update(updates)
      .eq("id", params.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
  };

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  return (
    <DevelopmentListingContext.Provider
      value={{
        data,
        completion,
        listingUnits: units,
        isLoading,
        isUnitsLoading,
        listingImages,
        isImagesLoading,
        isImageUploading: isUploading,
        fetchListingUnits,
        fetchListingImages,
        refreshListingUnits: fetchListingUnits,
        updateListing,
        refreshListing: fetchListing,
        refreshListingImages: fetchListingImages,
        handleImagesUpload: handleListingImagesUpload,
        deleteListingImage,
      }}
    >
      {children}
    </DevelopmentListingContext.Provider>
  );
}
