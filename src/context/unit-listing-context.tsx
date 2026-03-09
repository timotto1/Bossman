"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { UnitListing } from "@/types/types";
import { base64ToFile, getImageFileType } from "@/utils";
import {
  getFilenameFromSupabaseUrl,
  getListingImagesFromSupabase,
  uploadingListingsToSupabase,
} from "@/utils/storage";
import { createClient } from "@/utils/supabase/client";

type UnitListingContextType = {
  data: UnitListing | null;
  listingImages: string[];
  isLoading: boolean;
  isImagesLoading: boolean;
  isImageUploading: boolean;
  fetchListingImages: () => Promise<void>;
  updateListing: (updates: Partial<UnitListing>) => Promise<void>;
  refreshListing: () => Promise<void>;
  refreshListingImages: () => Promise<void>;
  handleImagesUpload: (base64s: string[]) => Promise<void>;
  deleteListingImage: (url: string) => Promise<void>;
};

const UnitListingContext = createContext<UnitListingContextType | undefined>(
  undefined,
);

export const useUnitListing = () => {
  const context = useContext(UnitListingContext);
  if (!context) {
    throw new Error("useUnitListing must be used within a UnitListingProvider");
  }
  return context;
};

export function UnitListingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const params = useParams();

  const { toast } = useToast();

  const [data, setData] = useState<UnitListing | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listingImages, setListingImages] = useState<string[]>([]);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchListing = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("unit_listings")
        .select("*")
        .eq("id", params.unitId)
        .maybeSingle();

      if (error) throw new Error(error.message);

      setData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [params.unitId, supabase]);

  const fetchListingImages = useCallback(async () => {
    setIsImagesLoading(true);
    try {
      const urls = await getListingImagesFromSupabase(
        "units",
        params?.unitId as string,
      );
      setListingImages(urls);
    } catch (error) {
      console.error(error);
    } finally {
      setIsImagesLoading(false);
    }
  }, [params?.unitId]);

  const updateListing = async (updates: Partial<UnitListing>) => {
    const { error } = await supabase
      .from("unit_listings")
      .update(updates)
      .eq("id", params.unitId)
      .maybeSingle();

    if (error) throw new Error(error.message);
  };

  const deleteListingImage = async (url: string) => {
    const supabase = createClient();
    const filename = getFilenameFromSupabaseUrl(url);
    if (filename) {
      await supabase.storage
        .from("listings")
        .remove([`units/media/${params.unitId}/${filename}`]);
    }

    await fetchListingImages();
  };

  const handleListingImagesUpload = async (base64s: string[]) => {
    setIsUploading(true);
    try {
      const supabase = createClient();
      const uploadPromises = base64s.map(async (base64) => {
        const filename = `${new Date().getTime()}.${getImageFileType(base64)}`;
        const file = base64ToFile(base64, filename);
        const supabasePath = `units/media/${params.unitId}/${filename}`;

        const { error } = await supabase.from("unit_listing_media").insert({
          unit_listing_id: params.unitId,
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

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  return (
    <UnitListingContext.Provider
      value={{
        data,
        isLoading,
        listingImages,
        isImagesLoading,
        isImageUploading: isUploading,
        refreshListing: fetchListing,
        updateListing,
        fetchListingImages,
        refreshListingImages: fetchListingImages,
        handleImagesUpload: handleListingImagesUpload,
        deleteListingImage,
      }}
    >
      {children}
    </UnitListingContext.Provider>
  );
}
