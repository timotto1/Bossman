import { createClient } from "./supabase/client";

export const getFilenameFromSupabaseUrl = (url: string) => {
  try {
    if (url.startsWith("data:image")) {
      return "Unsaved image";
    }

    const segments = new URL(url).pathname.split("/");
    return segments[segments.length - 1]; // last part of path
  } catch {
    return null;
  }
};

export const uploadingListingsToSupabase = async (
  path: string,
  file: File,
): Promise<string | null> => {
  if (!file) return null;

  const supabase = createClient();

  const { error } = await supabase.storage
    .from("listings")
    .upload(`${path}`, file, {
      upsert: true, // ✅ This replaces the file if it already exists
      cacheControl: "3600",
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = await supabase.storage
    .from("listings")
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  return data!.signedUrl!;
};

export const getListingImagesFromSupabase = async (
  type: string,
  listingId: string,
): Promise<string[]> => {
  const supabase = createClient();

  const folderPath = `${type}/media/${listingId}/`;

  const { data, error } = await supabase.storage
    .from("listings") // replace with your actual bucket
    .list(folderPath, {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    console.error("Error listing files:", error);
    return [];
  }

  // Generate public URLs for each file
  const urlsPromise = data
    .filter((file) => file.name) // ensure file has a name
    .map((file) =>
      supabase.storage
        .from("listings")
        .createSignedUrl(`${folderPath}${file.name}`, 60 * 60 * 24 * 7),
    );

  const urlsResolve = await Promise.all(urlsPromise);

  return urlsResolve.map((url) => url.data!.signedUrl!);
};

export const deleteListingsFromSupabase = async (filePaths: string[]) => {
  const supabase = createClient();

  const { error } = await supabase.storage.from("listings").remove(filePaths);

  if (error) throw new Error(error.message);
};
