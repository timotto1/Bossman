"use client";

import { useState } from "react";

import TableForm from "./table-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TableQuery } from "@/context/table-context";

export default function EditTableButton({ query }: { query: TableQuery }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="rounded-full bg-[#E3E2E4] text-[#706D78] px-2 py-1 min-w-[50px]">
          Edit
        </DialogTrigger>
        <DialogContent className="w-full max-w-[95%] md:max-w-[80%] overflow-hidden">
          <DialogTitle />
          <TableForm initialForm={query} handleClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
