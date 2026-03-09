import * as z from "zod";

export const campaignSchema = z.object({
  campaign: z.number(),
  channel: z.string(),
  sendDate: z.string(),
  clientName: z.string(),
  email: z.number(),
  clientStatus: z.string(),
  engagementRate: z.number().min(0).max(100),
});

export type CampaignSchema = z.infer<typeof campaignSchema>;
