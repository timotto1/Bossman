import { useState } from "react";
import { LoaderCircle, Trash } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ListingItemImage({
  url,
  showDeleteButton,
  deleteListingImage,
}: {
  url: string;
  showDeleteButton: boolean;
  deleteListingImage: (url: string) => Promise<void>;
}) {
  const { toast } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteListingImage(url);

      toast({
        title: "Success",
        description: "Listing image deleted successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden h-[126px] w-full group">
      <Image src={url} alt={url} fill className="object-cover rounded-xl" />

      {showDeleteButton && (
        <Button
          disabled={isDeleting}
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-20 rounded-full bg-black/50 text-white hover:bg-red-500 hover:text-white transition"
          onClick={handleImageDelete}
        >
          <Trash className="w-5 h-5" />
        </Button>
      )}

      {/* Optional overlay effect when hovering */}
      <div
        className={cn(
          "absolute flex items-center justify-center inset-0 transition",
          isDeleting
            ? "bg-black/50 z-30"
            : "bg-black/0 group-hover:bg-black/20 ",
        )}
      >
        {isDeleting && (
          <LoaderCircle className="h-8 w-8 text-white animate-spin" />
        )}
      </div>
    </div>
  );
}
