/*eslint-disable react-hooks/exhaustive-deps*/
"use client";

import { useCallback, useEffect, useState } from "react";
import { Row } from "@tanstack/react-table";
import { FileX, LoaderCircle } from "lucide-react";
import Image from "next/image";

import { TransactionsSchema } from "./schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";

export interface ResidentDocument {
  document_type: string;
  filename: string;
  id?: number;
  internal_name: string;
  openai_file_id?: string;
  resident_id?: number;
  supabase_path: string;
  staircasing_document_type?: string;
  document_size: number;
  uploaded_at?: string;
  download_url?: string;
}

export default function LeadDocuments({
  row,
}: {
  row: Row<TransactionsSchema>;
}) {
  const supabase = createClient();

  const [residentFiles, setResidentFiles] = useState<ResidentDocument[]>([]);

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getSignedUrl = useCallback(async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(filePath, 60 * 60);

    if (error) throw new Error(error.message);

    return data.signedUrl;
  }, []);

  const getLeadDocuments = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const { data, error } = await supabase
        .from("resident_documents")
        .select("*")
        .eq("resident_id", row.original.user_id);

      if (error) throw new Error(error.message);

      const filesWithSignedUrls = [];

      for await (const file of data as ResidentDocument[]) {
        try {
          const download_url = await getSignedUrl(file.supabase_path);
          filesWithSignedUrls.push({
            ...file,
            download_url,
          });
        } catch (err) {
          console.error(err);
        }
      }

      setResidentFiles(filesWithSignedUrls);
    } catch (err) {
      setIsError(true);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderFile = (file: ResidentDocument) => (
    <a
      href={file.download_url}
      target="_blank"
      className="flex items-center gap-2"
      key={file.id}
      download
    >
      <Image
        src="/pdf-circle-purple.svg"
        alt="pdf-circle-purple.svg"
        width={39}
        height={39}
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm text-[#111111]">{file.filename}</h4>
        <p className="text-xs text-gray-400">
          {new Date(file.uploaded_at!).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </a>
  );

  const renderDocumentSection = (title: string, files: ResidentDocument[]) => {
    return (
      <div className="space-y-4 overflow-hidden line-clamp-2 break-words">
        <h5 className="text-xs font-bold leading-4 text-[#26045D]">{title}</h5>
        {files.length ? files.map(renderFile) : <p>No documents available.</p>}
      </div>
    );
  };

  const filterDocumentsByType = (type: string) =>
    allDocuments.filter(
      (document) => document.staircasing_document_type === type,
    );

  useEffect(() => {
    getLeadDocuments();
  }, [getLeadDocuments]);

  const allDocuments = residentFiles.filter(
    (file) =>
      file.document_type === "staircasing_documents" ||
      file.document_type === "rics_surveys",
  );

  if (isLoading)
    return (
      <TableRow
        className="bg-white text-xs font-normal leading-4"
        key={row.id + "action"}
        id={row.id + "action"}
        data-state={row.getIsSelected() && "selected"}
      >
        <TableCell colSpan={row.getVisibleCells().length}>
          <LoaderCircle className="w-8 h-8 animate-spin mx-auto text-[#26045D]" />
          <p className="mt-2 text-sm text-gray-500 text-center">
            Loading documents, please wait...
          </p>
        </TableCell>
      </TableRow>
    );

  if (isError) {
    return (
      <TableRow
        className="bg-white text-xs font-normal leading-4"
        key={row.id + "action"}
        id={row.id + "action"}
        data-state={row.getIsSelected() && "selected"}
      >
        <TableCell colSpan={row.getVisibleCells().length}>
          <LoaderCircle className="w-8 h-8 animate-spin mx-auto text-[#26045D]" />
          <p className="text-[#26045D] text-center">Unable to get documents</p>
        </TableCell>
      </TableRow>
    );
  }

  if (!allDocuments.length) {
    return (
      <TableRow
        className="bg-white text-xs font-normal leading-4"
        key={row.id + "action"}
        id={row.id + "action"}
        data-state={row.getIsSelected() && "selected"}
      >
        <TableCell colSpan={row.getVisibleCells().length}>
          <div className="grid grid-cols-6 gap-4 mx-auto">
            <div>&nbsp;</div>
            <div className="space-y-4 col-span-4">
              <FileX size={48} className="mb-4 mx-auto text-[#26045D]" />
              <p className="text-md text-[#26045D] text-center font-semibold">
                No documents uploaded yet.
              </p>
              <p className="text-sm text-gray-400 mt-2 text-center">
                The lead has not uploaded any documents yet. Please check back
                later.
              </p>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow
      className="bg-white text-xs font-normal leading-4"
      key={row.id + "action"}
      id={row.id + "action"}
      data-state={row.getIsSelected() && "selected"}
    >
      <TableCell colSpan={row.getVisibleCells().length}>
        <div className="grid grid-cols-6 gap-4 mx-auto">
          <div>&nbsp;</div>
          {renderDocumentSection("Overview", filterDocumentsByType("overview"))}
          {renderDocumentSection(
            "Proof of Address",
            filterDocumentsByType("proof_of_address"),
          )}
          {renderDocumentSection(
            "Proof of ID",
            filterDocumentsByType("proof_of_identity"),
          )}
          {renderDocumentSection(
            "Transactional",
            filterDocumentsByType("transactional"),
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
