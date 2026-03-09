/*eslint-disable @typescript-eslint/no-explicit-any*/

import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { fetchHousePriceIndex } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || "eu-west-2",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

// Required headers for processing
const REQUIRED_HEADERS = [
  "Development Name",
  "Address_1",
  "Postcode",
  "Unit Type",
  "Internal ID (optional)",
  "Lease Type",
];

const OPTIONAL_HEADERS = [
  "Percentage Sold",
  "Town",
  "Monthly Rent at sale for 100%",
  "Service Charge",
  "Plot Number",
  "PurchaseDate (initial sale date)",
  "Purchase_Price (sale price)",
  "Address_2",
  "Address_3",
  "Lease Type",
  "Specified Rent (2.75%)",
  "Specified Rent Percentage",
];

const unitMappings: Record<string, string> = {
  mid_terrace: "terraced",
  end_terrace: "terraced",
  terrace: "terraced",
  semi_detached: "semi_detached",
  detached: "detached",
  bungalow: "detached", // Assuming bungalow is usually detached
  flat: "flat_maisonette",
  maisonette: "flat_maisonette",
  apartment: "flat_maisonette",
  duplex: "duplex",
  penthouse: "penthouse",
  other: "other",
  house: "detached",
};

// Header validation function - exact match only
function validateHeaders(jsonData: any[]) {
  if (!jsonData || jsonData.length === 0) {
    return {
      isValid: false,
      message: "No data found in Excel file",
      missingHeaders: REQUIRED_HEADERS,
      foundHeaders: [],
    };
  }

  // Get headers from first row
  const foundHeaders = Object.keys(jsonData[0]);

  // Check for required headers (exact match)
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !foundHeaders.includes(header),
  );

  if (missingHeaders.length > 0) {
    return {
      isValid: false,
      message: `Missing ${missingHeaders.length} required column(s). Headers must match exactly.`,
      missingHeaders,
      foundHeaders,
      expectedHeaders: REQUIRED_HEADERS,
      totalFoundHeaders: foundHeaders.length,
    };
  }

  return {
    isValid: true,
    message: "All required headers found",
    missingHeaders: [],
    foundHeaders,
    optionalHeadersPresent: OPTIONAL_HEADERS.filter((header) =>
      foundHeaders.includes(header),
    ),
  };
}

const excelDateToJavascript = (serial: number) => {
  if (!serial) return new Date();

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
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, { type: "array" });

    const unitSheet = workbook.SheetNames[0];

    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[unitSheet]);

    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: "No data found in Excel file" },
        { status: 400 },
      );
    }

    console.log(`Processing ${jsonData.length} rows`);

    // Step 1: Validate headers first
    const headerValidation = validateHeaders(jsonData);
    if (!headerValidation.isValid) {
      return NextResponse.json(
        {
          error: "Missing required columns",
          message: headerValidation.message,
          missingHeaders: headerValidation.missingHeaders,
          foundHeaders: headerValidation.foundHeaders,
          expectedHeaders: headerValidation.expectedHeaders,
          suggestion:
            "Please ensure all required columns are present with exact spelling and formatting",
        },
        { status: 400 },
      );
    }

    // Step 2: Validate developments first
    const validationResult = await validateDevelopments(jsonData);

    if (validationResult.invalidDevelopments.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid developments found",
          message: `${validationResult.invalidDevelopments.length} development(s) not found in database`,
          invalidDevelopments: validationResult.invalidDevelopments,
          validRows: validationResult.validRows,
          totalRows: jsonData.length,
          suggestion:
            "Please check development names or add missing developments to the system first",
        },
        { status: 400 },
      );
    }

    // Step 3: Validate postcodes
    const postcodeValidation = await validatePostcodes(jsonData);

    if (postcodeValidation.invalidPostcodes.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid postcodes found",
          message: `${postcodeValidation.invalidPostcodes.length} postcode(s) not found in database`,
          invalidPostcodes: postcodeValidation.invalidPostcodes,
          validPostcodes: postcodeValidation.validPostcodes.length,
          totalUniquePostcodes: postcodeValidation.totalUniquePostcodes,
          affectedRows: postcodeValidation.affectedRows,
          suggestion:
            "Please add missing postcodes to the postcode_data table or correct the postcode values",
        },
        { status: 400 },
      );
    }

    // Step 4: Process validated data
    if (validationResult.validRows <= 500) {
      // Small files: Process immediately
      const result = await processRowsDirectly(
        jsonData,
        validationResult.developmentMap,
      );
      return NextResponse.json({
        success: true,
        message: `Processed ${result.processed} units successfully. Skipped ${result.skipped} units.`,
        processed: result.processed,
        skipped: result.skipped,
        validatedDevelopments: validationResult.foundDevelopments.length,
      });
    } else {
      // Large files: Send to SQS with pre-validated development map
      await sendToSQSBatches(
        jsonData,
        validationResult.developmentMap,
        postcodeValidation.postcodeMap,
      );
      return NextResponse.json({
        success: true,
        message: `Processing ${jsonData.length} units in background.`,
        validatedDevelopments: validationResult.foundDevelopments.length,
      });
    }
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}

async function sendToSQSBatches(
  jsonData: any[],
  developmentMap: Map<string, string>,
  postcodeMap: Map<string, string>,
) {
  if (!process.env.SQS_QUEUE_URL) {
    throw new Error("SQS_QUEUE_URL not configured");
  }

  // Smart calculation
  const optimalBatches = Math.ceil(jsonData.length / 500);
  const actualBatches = Math.min(optimalBatches, 100);
  const finalBatchSize = Math.ceil(jsonData.length / actualBatches);

  console.log(
    `Sending ${jsonData.length} rows in ${Math.ceil(jsonData.length / finalBatchSize)} batches of ${finalBatchSize} rows each`,
  );

  // Convert Maps to objects for JSON serialization
  const developmentMapObj = Object.fromEntries(developmentMap);
  const postcodeMapObj = Object.fromEntries(postcodeMap);

  const promises = [];

  for (let i = 0; i < jsonData.length; i += finalBatchSize) {
    const batch = jsonData.slice(i, i + finalBatchSize);
    const batchIndex = Math.floor(i / finalBatchSize);

    const command = new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify({
        rows: batch,
        batchIndex,
        totalBatches: Math.ceil(jsonData.length / finalBatchSize),
        developmentMap: developmentMapObj,
        postcodeMap: postcodeMapObj,
        timestamp: new Date().toISOString(),
      }),
    });

    // Add promise to queue
    const promise = sqsClient.send(command).then(() => {
      console.log(`Sent batch ${batchIndex + 1} with ${batch.length} rows`);
    });

    promises.push(promise);
  }

  // Wait for all to complete
  await Promise.all(promises);
}

// Enhanced process function with pre-validated development map
async function processRowsDirectly(
  rows: any[],
  developmentMap: Map<string, string>,
) {
  const supabase = await createClient();
  const hpis = await fetchHousePriceIndex();

  // Get all postcodes at once
  const allPostcodes = [
    ...new Set(rows.map((row) => row["Postcode"]?.trim().split(" ").join(""))),
  ].filter(Boolean);

  const { data: postcodeData } = await supabase
    .from("postcode_data")
    .select("postcode, local_authority")
    .in("postcode", allPostcodes);

  const postcodeMap = new Map(
    postcodeData?.map((p) => [p.postcode, p.local_authority]) || [],
  );

  // Process with pre-validated development map
  return await processBatch(rows, hpis, postcodeMap, developmentMap);
}

async function processBatch(
  batch: any[],
  hpis: any[],
  postcodeMap: Map<string, string>,
  developmentMap?: Map<string, string>, // Optional pre-validated map
) {
  const supabase = await createClient();

  // Use provided development map or fetch fresh one
  let finalDevelopmentMap = developmentMap;

  if (!finalDevelopmentMap) {
    // Fallback: Fetch developments for this batch only
    const uniqueDevNames = [
      ...new Set(batch.map((row) => row["Development Name"]?.trim())),
    ].filter(Boolean);

    const { data: batchDevelopments, error } = await supabase
      .from("company_development")
      .select("id, name")
      .in("name", uniqueDevNames);

    if (error) {
      console.error("Development lookup error:", error);
      finalDevelopmentMap = new Map();
    } else {
      finalDevelopmentMap = new Map();
      batchDevelopments?.forEach((dev: any) => {
        if (dev.name) {
          finalDevelopmentMap!.set(dev.name.trim(), dev.id);
        }
      });
    }
  }

  const unitsData = [];
  let valuationData = [];
  let processed = 0;
  let skipped = 0;
  let invalidDevelopment = 0;

  for (const data of batch) {
    const values = data as Record<string, string>;
    const development_name = values["Development Name"];
    const development_id = finalDevelopmentMap.get(development_name?.trim());

    if (!development_id) {
      console.log(`❌ Development not found: ${development_name}`);
      invalidDevelopment++;
      skipped++;
      continue;
    }

    const internal_id = values["Internal ID (optional)"];
    const plot_number = values["Plot Number"];
    const address_1 = values["Address_1"];
    const address_2 = values["Address_2"];
    const address_3 = values["Address_3"];
    const postcode = values["Postcode"];
    const city = values["Town"];
    const lease_type = values["Lease Type"];
    const unit_type = (values["Unit Type"] as string)
      ?.toLowerCase()
      ?.split("-")
      ?.join(" ")
      ?.split(" ")
      .join("_");

    const purchase_date = excelDateToJavascript(
      parseInt(values["PurchaseDate (initial sale date)"]),
    );
    const purchase_price = parseFloat(values["Purchase_Price (sale price)"]);
    const monthly_rent = parseFloat(values["Monthly Rent at sale for 100%"]);
    const specified_rent = parseFloat(values["Specified Rent (2.75%)"]);
    const specified_rent_percentage = parseFloat(
      values["Specified Rent Percentage"],
    );
    const percentage_sold = parseFloat(values["Percentage Sold"]);
    const service_charge = parseFloat(values["Service Charge"]);

    const region =
      postcodeMap.get(postcode?.trim().split(" ").join("")) || "Unknown";

    if (region === "Unknown") {
      console.log(`❌ Region not found for postcode: ${postcode}`);
      skipped++;
      continue;
    }

    // All validations passed - process the unit
    const targetHPIDate = new Date(
      `${new Date(purchase_date).getFullYear()}-${(new Date(purchase_date).getMonth() + 1).toString().padStart(2, "0")}-01`,
    );

    let oldHpiData = hpis.find(
      (hpi: any) =>
        hpi.region === region && new Date(hpi.for_month) <= targetHPIDate,
    );

    if (!oldHpiData) {
      oldHpiData = hpis.find(
        (hpi: any) =>
          hpi.region === region && new Date(hpi.for_month) <= new Date(),
      );
    }

    if (oldHpiData) {
      const newHpiData = hpis.find((hpi: any) => hpi.region === region);
      const oldHpi =
        (unit_type
          ? oldHpiData[`index_value_${unitMappings[unit_type]}`]
          : oldHpiData?.index_value) / 100;
      const newHpi =
        (unit_type
          ? newHpiData[`index_value_${unitMappings[unit_type]}`]
          : newHpiData?.index_value) / 100;

      valuationData.push({
        valuation_date: newHpiData?.for_month,
        valuation_amount: (purchase_price * (newHpi / oldHpi)).toFixed(2),
        valuation_source: "Land Registry",
        house_price_index_value: newHpi,
      });

      unitsData.push({
        status: "occupied",
        development_id,
        postcode,
        region,
        purchase_price,
        purchase_date,
        monthly_rent,
        city,
        unit_type,
        specified_rent,
        address_1,
        address_2,
        address_3,
        service_charge,
        internal_id,
        plot_number,
        percentage_sold,
        lease_type,
        specified_rent_percentage: specified_rent_percentage || 2.75,
        house_price_index_value: oldHpi,
        is_verified: true,
      });
      processed++;
      console.log(
        `✅ Processed unit: ${internal_id || plot_number} in ${development_name}`,
      );
    } else {
      console.log(`❌ HPI Data not found: ${region} - ${postcode}`);
      skipped++;
    }
  }

  if (unitsData.length > 0) {
    const { data, error: unitError } = await supabase
      .from("company_development_units")
      .upsert(unitsData, { onConflict: "internal_id" })
      .select("id");

    if (unitError) throw new Error(unitError.message);

    valuationData = valuationData.map((item, index) => ({
      ...item,
      unit_id: data[index]?.id,
    }));

    const { error: valuationError } = await supabase
      .from("unit_valuation")
      .upsert(valuationData, { onConflict: "unit_id" });

    if (valuationError) throw new Error(valuationError.message);
  }

  return {
    processed,
    skipped,
    invalidDevelopment,
    breakdown: {
      invalidDevelopment,
      missingFields: skipped - invalidDevelopment,
      processed,
    },
  };
}

// New validation function
async function validateDevelopments(jsonData: any[]) {
  const supabase = await createClient();

  // Get all unique development names from the entire file
  const uniqueDevNames = [
    ...new Set(jsonData.map((row) => row["Development Name"]?.trim())),
  ].filter(Boolean);

  console.log(`Validating ${uniqueDevNames.length} unique developments`);

  // Fetch all developments that appear in the file
  const { data: foundDevelopments, error } = await supabase
    .from("company_development")
    .select("id, name")
    .in("name", uniqueDevNames);

  if (error) {
    throw new Error(`Development validation failed: ${error.message}`);
  }

  // Create maps for quick lookup
  const developmentMap = new Map<string, string>();
  const foundDevNames = new Set<string>();

  foundDevelopments?.forEach((dev) => {
    if (dev.name) {
      const normalizedName = dev.name.trim();
      developmentMap.set(normalizedName, dev.id);
      foundDevNames.add(normalizedName);
    }
  });

  // Find missing developments
  const invalidDevelopments = uniqueDevNames.filter(
    (name) => !foundDevNames.has(name?.trim()),
  );

  // Count valid rows
  const validRows = jsonData.filter((row) => {
    const devName = row["Development Name"]?.trim();
    return foundDevNames.has(devName);
  }).length;

  return {
    developmentMap,
    foundDevelopments: foundDevelopments || [],
    invalidDevelopments,
    validRows,
    totalRows: jsonData.length,
  };
}

// New postcode validation function
async function validatePostcodes(jsonData: any[]) {
  const supabase = await createClient();

  // Get all unique postcodes from the entire file (normalized)
  const uniquePostcodes = [
    ...new Set(
      jsonData.map((row) => row["Postcode"]?.trim().split(" ").join("")),
    ),
  ].filter(Boolean);

  console.log(`Validating ${uniquePostcodes.length} unique postcodes`);

  // Fetch all postcodes that appear in the file
  const { data: foundPostcodes, error } = await supabase
    .from("postcode_data")
    .select("postcode, local_authority")
    .in("postcode", uniquePostcodes);

  if (error) {
    throw new Error(`Postcode validation failed: ${error.message}`);
  }

  // Create maps for quick lookup
  const postcodeMap = new Map<string, string>();
  const foundPostcodeSet = new Set<string>();

  foundPostcodes?.forEach((pc) => {
    if (pc.postcode) {
      postcodeMap.set(pc.postcode, pc.local_authority);
      foundPostcodeSet.add(pc.postcode);
    }
  });

  // Find missing postcodes
  const invalidPostcodes = uniquePostcodes.filter(
    (postcode) => !foundPostcodeSet.has(postcode),
  );

  // Count affected rows
  const affectedRows = jsonData.filter((row) => {
    const normalizedPostcode = row["Postcode"]?.trim().split(" ").join("");
    return invalidPostcodes.includes(normalizedPostcode);
  }).length;

  return {
    postcodeMap,
    validPostcodes: Array.from(foundPostcodeSet),
    invalidPostcodes,
    totalUniquePostcodes: uniquePostcodes.length,
    affectedRows,
  };
}
