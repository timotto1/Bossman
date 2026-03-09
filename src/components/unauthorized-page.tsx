// app/unauthorized/page.tsx
"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md text-center bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Unauthorized Access
        </h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to view this page. If you believe this is a
          mistake, please contact your administrator.
        </p>
        <Link href="/dashboard">
          <Button className="mx-auto flex items-center gap-2 text-white px-6 text-sm rounded-[12px] bg-gradient-to-r from-[#7747FF] to-[#9847FF] h-8 hover:from-[#5a2dbf] hover:to-[#6a2dbf]">
            Go Back Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
