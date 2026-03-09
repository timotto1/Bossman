"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

import TableForm from "./table-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TableDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-fit flex items-center rounded-[10px] bg-[#26045D] h-8 hover:bg-[#26045D] text-white gap-2 px-2 py-1">
        <PlusIcon className="w-5 h-5 text-white" />
        Create
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95%] md:max-w-[80%] overflow-hidden">
        <DialogTitle />
        <TableForm initialForm={null} handleClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
