import { z } from "zod";

export const allListingsSchema = z.object({
  id: z.coerce.number(),
  postcode: z.string(),
  development_name: z.string(),
  city: z.string(),
  type: z.string(),
  total_units: z.coerce.number(),
  units_for_sale: z.coerce.number(),
  units_sold: z.coerce.number(),
  total_development_value: z.coerce.number(),
  created_at: z.string(),
});

export type AllListingsSchema = z.infer<typeof allListingsSchema>;

export const draftListingsSchema = z.object({
  id: z.coerce.number(),
  postcode: z.string(),
  development_name: z.string(),
  address_1: z.string(),
  completion_percentage: z.coerce.number(),
  city: z.string(),
  type: z.string(),
  total_development_value: z.coerce.number(),
  created_at: z.string(),
});

export type DraftListingsSchema = z.infer<typeof draftListingsSchema>;

export const unlistedListingsSchema = z.object({
  id: z.coerce.number(),
  postcode: z.string(),
  development_name: z.string(),
  address_1: z.string(),
  completion_percentage: z.coerce.number(),
  city: z.string(),
  type: z.string(),
  total_development_value: z.coerce.number(),
  created_at: z.string(),
});

export type UnlistedListingsSchema = z.infer<typeof unlistedListingsSchema>;

export const liveListingSchema = z.object({
  id: z.coerce.number(),
  postcode: z.string(),
  development_name: z.string(),
  address_1: z.string(),
  city: z.string(),
  type: z.string(),
  rightmove_status: z.string(),
  total_development_value: z.coerce.number(),
  created_at: z.string(),
});

export type LiveListingsSchema = z.infer<typeof liveListingSchema>;
