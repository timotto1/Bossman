import { z } from "zod";

export const enquirySchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  development_name: z.string(),
  unit_id: z.coerce.number(),
  email: z.string().email(),
  household_income: z.coerce.number(),
  deposit: z.coerce.number(),
  eligibility_status: z.string(),
  created_at: z.string(),
});

export type EnquirySchema = z.infer<typeof enquirySchema>;
