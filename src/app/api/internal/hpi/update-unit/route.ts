import { NextRequest, NextResponse } from "next/server";

import { fetchHousePriceIndex } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";

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

const updateUnitValuation = async (unitID: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("company_development_units")
    .select("*")
    .eq("id", unitID)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const hpis = await fetchHousePriceIndex();

  const purchaseDate = new Date(data?.purchase_date);
  const region = data?.region;

  const targetHPIDate = new Date(
    `${purchaseDate.getFullYear()}-${(purchaseDate.getMonth() + 1).toString().padStart(2, "0")}-01`,
  );
  const newHpiData = hpis.find((hpi) => hpi.region === region);
  let oldHpiData = hpis.find(
    (hpi) => hpi.region === region && new Date(hpi.for_month) <= targetHPIDate,
  );

  if (!oldHpiData) {
    oldHpiData = hpis.find(
      (hpi) => hpi.region === region && new Date(hpi.for_month) <= new Date(),
    );
  }

  if (oldHpiData) {
    const newHpi =
      (newHpiData[`index_value_${unitMappings[data?.unit_type]}`] ||
        newHpiData?.index_value) / 100;
    const oldHpi =
      (oldHpiData[`index_value_${unitMappings[data?.unit_type]}`] ||
        oldHpiData?.index_value) / 100;

    const newValuation = data?.purchase_price * (newHpi / oldHpi);

    await supabase.from("unit_valuation").upsert(
      {
        unit_id: data?.id,
        valuation_date: newHpiData?.for_month,
        valuation_amount: newValuation,
        valuation_source: "Land Registry",
        house_price_index_value: newHpi,
      },
      { onConflict: "unit_id" },
    );
  }
};

export async function POST(request: NextRequest) {
  try {
    const { unitID } = await request.json();

    await updateUnitValuation(unitID);

    return NextResponse.json({
      message: "SUCCESS",
      data: { unitID },
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
