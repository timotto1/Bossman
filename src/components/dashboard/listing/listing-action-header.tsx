"use client";
import { HomeIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

export function ListingActionHeader() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          href="/dashboard"
          className="flex items-center space-x-1 bg-transparent hover:bg-transparent gap-0"
        >
          <Image
            src="/stairpay-logo.svg"
            alt="Stairpay Logo"
            width={18}
            height={18}
          />
          <h1 className="text-lg font-bold text-[#26045D]">stairpay</h1>
        </Link>
        <div className="flex items-center space-x-2">
          <Link
            href="/dashboard/listing"
            className="flex text-[#26045D] text-sm bg-[#F0F0FE] hover:bg-[#d9d9f9] rounded-full items-center py-2 px-4"
          >
            <HomeIcon className="w-4 h-4 mr-1" /> Back to listing page
          </Link>
        </div>
      </div>
    </>
  );
}
