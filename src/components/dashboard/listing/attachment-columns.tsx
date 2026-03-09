import { ColumnDef } from "@tanstack/react-table";

import { attachmentTypes } from "./listing-attachments-form";
import ListingAttachmentsTableActions from "./listing-attachments-table-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { ListingDocument } from "@/types/types";

export const listingAttachmentColumns: ColumnDef<ListingDocument>[] = [
  {
    id: "select",
    cell: ({ row, table }) => (
      <Checkbox
        className="data-[state=checked]:bg-[#26045D] border-[#26045D]"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          if (value) {
            // Clear all selections except this row
            table.getSelectedRowModel().rows.forEach((r) => {
              if (r.id !== row.id && r.getIsSelected()) {
                r.toggleSelected(false);
              }
            });
            row.toggleSelected(true);
          } else {
            row.toggleSelected(false);
          }
        }}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "document_type",
    header: "Document name",
    enableSorting: false,
    cell: ({ row }) => (
      <>
        {
          attachmentTypes.find(
            (attachment) => attachment.value === row.original.document_type,
          )?.label
        }
      </>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date Added",
    enableSorting: false,
    cell: ({ row }) => (
      <>
        {new Date(row.original.created_at)
          .toLocaleDateString("en-GB")
          .replaceAll("/", "-")}
      </>
    ),
  },
  {
    accessorKey: "document_name",
    header: "File name",
    enableSorting: false,
  },
  {
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => <ListingAttachmentsTableActions row={row} />,
  },
];
