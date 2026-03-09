import * as z from "zod";

export const staircasingInitiativeSchema = z.object({
  id: z.string(),
  category: z.string(),
  description: z.string(),
  status: z.string(),
  reviewDate: z.string(),
  completeDate: z.string(),
  createDate: z.string(),
  nextReviewDate: z.string(),
  deadline: z.string(),
});

export type StaircasingInitiativeSchema = z.infer<
  typeof staircasingInitiativeSchema
>;
