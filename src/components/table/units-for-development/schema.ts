import * as z from "zod";

export const unitForDevelopmentSchema = z.object({
  id: z.string(),
  unitType: z.string(),
  status: z.string(),
  rent: z.number(),
  occupant: z.string().nullable(),
  postcode: z.string(),
});

export type UnitForDevelopmentSchema = z.infer<typeof unitForDevelopmentSchema>;
