import * as z from "zod";

export const metricSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  performance: z.string(),
  value: z.number(),
});

export type MetricSchema = z.infer<typeof metricSchema>;
