import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { createClient } from "@/utils/supabase/server";

const excelDateToJavascript = (serial: number) => {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial) + 0.0000001;

  let total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;

  total_seconds -= seconds;

  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;

  return new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate(),
    hours,
    minutes,
    seconds,
  );
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const companyID = formData.get("company") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, { type: "array" });

    const developmentSheet = workbook.SheetNames[1];

    const jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[developmentSheet],
    );

    const formattedData = [];

    for await (const data of jsonData) {
      const values = Object.values(data as Record<string, string>);
      const name = values[0];
      const postcode = values[1];
      const city = values[2];
      const is_shared_ownership = values[3] === "Y";
      const is_help_to_buy = values[4] === "Y";
      const housing_provider = values[5];
      const completion_date = excelDateToJavascript(parseInt(values[6]));
      const management_company = values[7];

      formattedData.push({
        company_id: companyID,
        name,
        postcode,
        city,
        is_shared_ownership,
        is_help_to_buy,
        completion_date,
        housing_provider,
        management_company,
      });
    }

    const { error } = await supabase
      .from("company_development")
      .upsert(formattedData, {
        onConflict: "name",
      });

    if (error) throw new Error(error.message);

    return NextResponse.json({
      message: "Developments inserted successfully!",
      data: formattedData,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
