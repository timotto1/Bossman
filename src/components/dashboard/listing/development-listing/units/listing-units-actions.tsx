import Link from "next/link";
import { useParams } from "next/navigation";

export default function ListingUnitsActions({ id }: { id: string }) {
  const params = useParams();

  return (
    <Link
      href={`/dashboard/listing/${params.id}/unit/${id}`}
      className="text-[#AE78F1] hover:underline flex items-center font-semibold"
    >
      View
    </Link>
  );
}
