import * as z from "zod";

export const signupsLast30daysSchema = z.object({
  user_id: z.string(),
  annual_household_income: z.number(),
  bucket: z.string(),
  current_share: z.number(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
});

export type SignupsLast30DaysSchema = z.infer<typeof signupsLast30daysSchema>;

const caseManagerSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
});

export type CaseManagerSchema = z.infer<typeof caseManagerSchema>;

export const caseManagerTransactionsSchema = z.object({
  case_manager_name: z.string(),
  completed_cases: z.object({
    value: z.number(),
    change: z.number(),
  }),
  completed_value: z.object({
    value: z.number(),
    change: z.number(),
  }),
  pipeline_cases: z.object({
    value: z.number(),
    change: z.number(),
  }),
  pipeline_value: z.object({
    value: z.number(),
    change: z.number(),
  }),
});

export type CaseManagerTransactionsSchema = z.infer<
  typeof caseManagerTransactionsSchema
>;

export const transactionsSchema = z.object({
  user_id: z.string(),
  current_ownership_percentage: z.number(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  purchase_amount: z.number(),
  address: z.string(),
  bucket: z.string(),
  current_share: z.number(),
  application_status: z.string(),
  case_manager: z.string(),
  case_managers_list: z.array(caseManagerSchema),
  archived: z.boolean(),
  created_at: z.string(),
  transaction_size: z.number(),
});

export type TransactionsSchema = z.infer<typeof transactionsSchema>;

export const insightsSchema = z.object({
  user_id: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  address: z.string(),
  annual_household_income: z.number(),
  cash_savings: z.number(),
  move_in_date: z.string(),
});

export type InsightsSchema = z.infer<typeof insightsSchema>;

export const financialDifficultySchema = z.object({
  user_id: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  monthly_income: z.number(),
  housing_costs: z.number(),
  other_monthly_costs: z.number(),
  costs_percentage: z.number(),
});

export type FinancialDifficultySchema = z.infer<
  typeof financialDifficultySchema
>;

export const mortgageExpirySchema = z.object({
  user_id: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  rate_end_date: z.string(),
  lender_name: z.string(),
  maximum_share: z.number(),
});

export type MortgageExpirySchema = z.infer<typeof mortgageExpirySchema>;

export const overviewSchema = z.object({
  user_id: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  annual_household_income: z.number(),
  bucket: z.string(),
  address: z.string(),
  current_share: z.number(),
  cash_savings: z.number(),
  move_in_date: z.string(),
  signup_date: z.string(),
  has_client_transaction: z.boolean(),
});

export type OverviewSchema = z.infer<typeof overviewSchema>;

export const readyToTransactSchema = z.object({
  user_id: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  annual_household_income: z.number(),
  cash_savings: z.number(),
  maximum_share: z.number(),
  transaction_value: z.number(),
});

export type ReadyToTransactSchema = z.infer<typeof readyToTransactSchema>;

export const leadSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  salary: z.number(),
  bucket: z.string(),
  address: z.string(),
  ownership: z.number(),
  savings: z.number(),
  maxShare: z.number(),
  transactionValue: z.number(),
  mortgageExpiry: z.string(),
  broker: z.string(),
  lender: z.string(),
  monthlyIncome: z.number(),
  housingCosts: z.number(),
  otherMonthlyCosts: z.number(),
  costPercentage: z.number(),
  purchaseAmount: z.number(),
  transactionBucket: z.string(),
  complaintStatus: z.string(),
  complaintDescription: z.string(),
  complaintDate: z.string(),
  vulnerableScore: z.number(),
  vulnerableDateIdentified: z.string(),
  vulnerableDateAdded: z.string(),
});

export type LeadSchema = z.infer<typeof leadSchema>;
