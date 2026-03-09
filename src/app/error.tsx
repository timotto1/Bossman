"use client";

import NotFound from "@/components/not-found";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <NotFound />
    </div>
  );
}
