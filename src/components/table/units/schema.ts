import * as z from "zod";

export const unitSchema = z.object({
  unit_id: z.string(),
  address: z.string(),
  postcode: z.string(),
  development_name: z.string(),
  unit_type: z.string(),
  monthly_rent: z.number(),
  status: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  valuation_amount: z.number(),
  hpi_change_pct: z.number(),
  resident_id: z.number(),
});

export type UnitSchema = z.infer<typeof unitSchema>;
