import * as z from "zod";

export const developmentSchema = z.object({
  id: z.number().optional(), // Optional if not explicitly needed
  name: z.string(),
  postcode: z.string(),
  city: z.string(),
  total_units: z.number(),
  units_for_sale: z.number(),
  units_occupied: z.number(), // Keeping it as a string to include '%' symbol
  occupancy_rate: z.number(),
  valuation_change_pct: z.number(),
  created_at: z.string(), // Assuming date is stored in string format
});

export type DevelopmentSchema = z.infer<typeof developmentSchema>;
