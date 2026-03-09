/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

import { fetchHousePriceIndex } from "@/lib/utils";

const createSupabaseClient = (url: string, key: string, schema = "public") =>
  createClient(url, key, { db: { schema } });

const getPropertyValuationHandler = async (
  company: number | null = null,
  batch_number: number | null = null,
  batch_size: number = 1000,
) => {
  const BATCH_SIZE = Math.min(Math.max(batch_size, 1), 1000);

  const unitMappings: Record<string, string> = {
    mid_terrace: "terraced",
    end_terrace: "terraced",
    terrace: "terraced",
    semi_detached: "semi_detached",
    detached: "detached",
    bungalow: "detached",
    flat: "flat_maisonette",
    maisonette: "flat_maisonette",
    apartment: "flat_maisonette",
    duplex: "duplex",
    penthouse: "penthouse",
    other: "other",
    house: "detached",
  };

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const hpis = await fetchHousePriceIndex();

  let allProperties = [];
  let offset = 0;
  let hasMore = true;
  let currentBatchNumber = 0;

  while (hasMore) {
    currentBatchNumber++;
    const rpcName = company
      ? "get_properties_to_be_evaluated_via_company"
      : "get_properties_to_be_evaluated";
    const rpcParams = company ? { company } : {};

    const { error, data } = await supabase
      .rpc(rpcName, rpcParams, {
        count: "exact",
        head: false,
      })
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      console.error("Error fetching properties:", error);
      break;
    }

    if (batch_number === currentBatchNumber || !batch_number) {
      console.log(
        `STARTED: BATCH N0. - ${currentBatchNumber} | BATCH SIZE - ${BATCH_SIZE} | COMPANY - ${company || "ALL COMPANY"}`,
      );

      allProperties.push(...data);

      const queries = allProperties.map(
        async (property: any, index: number) => {
          const targetHPIDate = new Date(
            `${new Date(property?.purchase_date).getFullYear()}-${(new Date(property?.purchase_date).getMonth() + 1).toString().padStart(2, "0")}-01`,
          );
          const newHpiData = hpis.find((hpi) => hpi.region === property.region);
          let oldHpiData = hpis.find(
            (hpi) =>
              hpi.region === property.region &&
              new Date(hpi.for_month) <= targetHPIDate,
          );

          if (!oldHpiData) {
            oldHpiData = hpis.find(
              (hpi) =>
                hpi.region === property.region &&
                new Date(hpi.for_month) <= new Date(),
            );
          }

          if (oldHpiData) {
            const newHpi =
              (newHpiData[`index_value_${unitMappings[property.unit_type]}`] ||
                newHpiData?.index_value) / 100;
            const oldHpi =
              (oldHpiData[`index_value_${unitMappings[property.unit_type]}`] ||
                oldHpiData?.index_value) / 100;

            const newValuation = property?.purchase_price * (newHpi / oldHpi);

            console.log(
              `BATCH ${currentBatchNumber}-${index} : UNIT_ID - ${property?.development_unit_id} | VALUATION_DATE - ${newHpiData?.for_month} | VALUATION_AMOUNT - ${newValuation} | VALUATION_SOURCE - Land Registry | HOUSE_PRICE_INDEX_VALUE - ${newHpi}`,
            );

            await supabase
              .from("company_development_units")
              .update({
                house_price_index_value: oldHpi,
              })
              .eq("id", property?.development_unit_id);

            return {
              unit_id: property?.development_unit_id,
              valuation_date: newHpiData?.for_month,
              valuation_amount: newValuation,
              valuation_source: "Land Registry",
              house_price_index_value: newHpi,
            };
          }

          return null;
        },
      );

      const { error: upsertError } = await supabase
        .from("unit_valuation")
        .upsert(queries, { onConflict: "unit_id" });

      if (upsertError) {
        console.log(
          `[UV] ERROR: BATCH N0. - ${currentBatchNumber} | BATCH SIZE - ${BATCH_SIZE} | COMPANY - ${company || "ALL COMPANY"} | ERROR_MESSAGE - ${upsertError.message}`,
        );
      } else {
        console.log(
          `[UV] FINISHED: BATCH N0. - ${currentBatchNumber} | BATCH SIZE - ${BATCH_SIZE} | COMPANY - ${company || "ALL COMPANY"}`,
        );
      }
    }

    allProperties = [];
    offset += BATCH_SIZE;
    hasMore = data.length === BATCH_SIZE;
  }

  console.log(
    `COMPANY - ${company || "ALL COMPANY"} | TOTAL_BATCH_NUMBER - ${currentBatchNumber}`,
  );
};

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as {
    role: string;
    app: string;
  };

  if (payload.role !== "hpi-batch-update") {
    return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
  }

  if (payload.app !== "pluto-platform") {
    return NextResponse.json({ error: "Unauthorized app" }, { status: 403 });
  }

  try {
    const { companyId, batchNumber, batchSize } = await request.json();

    await getPropertyValuationHandler(companyId, batchNumber, batchSize);

    return NextResponse.json({
      message: "SUCCESS",
      data: { companyId, batchNumber, batchSize },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
