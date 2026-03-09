import { StaircasingInitiativeSchema } from "../table/staircasing-initiative/schema";

export const attentionRequiredInitiatives: StaircasingInitiativeSchema[] = [
  {
    id: "61735dae-3972-481a-b252-bb792df70ffc",
    category: "new_complaint",
    description:
      "You have a resident from <b>The Grange, Surrey</b>, who has complained about his Service Charge increase in 2025. This is the second complaint.",
    status: "action_required",
    reviewDate: "22 November 2024",
    completeDate: "12 December 2024",
    createDate: "",
    nextReviewDate: "",
    deadline: "",
  },
  {
    id: "c79769b1-d695-459a-8e85-506ba096e4ad",
    category: "consumer_duty_failing",
    description:
      "You need to attach evidence from your Last <b>Product Board</b> to ensure they meet customer needs and deliver good outcomes.",
    status: "action_required",
    reviewDate: "28 October 2024",
    completeDate: "24 December 2024",
    createDate: "",
    nextReviewDate: "",
    deadline: "",
  },
  {
    id: "8fcd561a-b9e4-4f2a-9bc7-e80366790e7b",
    category: "consumer_duty_failing",
    description:
      "You are missing records <b>demonstrating how pricing reflects the value offered</b> to customers without causing harm.",
    status: "action_required",
    reviewDate: "22 October 2024",
    completeDate: "22 December 2024",
    createDate: "",
    nextReviewDate: "",
    deadline: "",
  },
  {
    id: "7a57c1a1-6bfc-4c16-9065-99d6743dbd2c",
    category: "consumer_duty_failing",
    description:
      "You are missing <b>Internal policies</b> showing how products and services are designed, approved, and monitored.",
    status: "action_required",
    reviewDate: "15 October 2024",
    completeDate: "10 December 2024",
    createDate: "",
    nextReviewDate: "",
    deadline: "",
  },
];

export const initiatives: StaircasingInitiativeSchema[] = [
  {
    id: "5afdfc40-6c3a-40fc-a755-ed894f63202a",
    category: "staircasing",
    description:
      "We want more people to <b>staircase</b> and gain a higher equity in their property, decreasing the rent they pay.",
    status: "in_progress",
    createDate: "22 November 2024",
    nextReviewDate: "12 December 2024",
    reviewDate: "",
    completeDate: "",
    deadline: "",
  },
  {
    id: "7277d3e8-f590-4394-8b23-2ce2afd39316",
    category: "staircasing",
    description:
      "We want to reduce the <b>volume of complaints</b> we receive about Staircasing",
    status: "draft",
    createDate: "28 October 2024",
    nextReviewDate: "24 December 2024",
    reviewDate: "",
    completeDate: "",
    deadline: "",
  },
  {
    id: "76855c57-58a8-4edd-880d-e44a05a86ef4",
    category: "internal_strategy",
    description:
      "We are missing records <b>demonstrating how pricing reflects the value offered</b> to customers without causing harm.",
    status: "in_review",
    createDate: "22 October 2024",
    nextReviewDate: "22 December 2024",
    reviewDate: "",
    completeDate: "",
    deadline: "",
  },
  {
    id: "e26de3cb-8dda-43dc-bad9-25b215db4fb0",
    category: "consumer_duty",
    description:
      "We are missing <b>Internal policies</b> showing how products and services are designed, approved, and monitored.",
    status: "actions_overdue",
    createDate: "15 October 2024",
    nextReviewDate: "10 December 2024",
    reviewDate: "",
    completeDate: "",
    deadline: "",
  },
];

export const actionsReqiredInitiatives: StaircasingInitiativeSchema[] = [
  {
    id: "d066f654-368e-4310-99ae-a4020419aaab",
    category: "target_market_assessments",
    description:
      "Documentation showing thorough research and clear identification of target customer needs, preferences, and vulnerabilities.",
    status: "action_required",
    reviewDate: "22 November 2024",
    deadline: "22 December 2024",
    nextReviewDate: "",
    completeDate: "",
    createDate: "",
  },
  {
    id: "4cb9a28d-520a-4949-be8b-0c6cb5223b98",
    category: "testing_outcomes",
    description:
      "Evidence from product/service testing to ensure they meet customer needs and deliver good outcomes.",
    status: "action_required",
    reviewDate: "28 November 2024",
    deadline: "28 December 2024",
    nextReviewDate: "",
    completeDate: "",
    createDate: "",
  },
  {
    id: "e772cb5f-25c8-4a20-a72a-7ab6d3296143",
    category: "fair_value_analysis",
    description:
      "Records demonstrating how pricing reflects the value offered to customers without causing harm.",
    status: "action_required",
    reviewDate: "29 November 2024",
    deadline: "29 December 2024",
    nextReviewDate: "",
    completeDate: "",
    createDate: "",
  },
  {
    id: "7ab42b68-caf6-43a7-80a2-617e8db09864",
    category: "policies_and_procedures",
    description:
      "Internal policies showing how products and services are designed, approved, and monitored.",
    status: "action_required",
    reviewDate: "30 November 2024",
    deadline: "30 December 2024",
    nextReviewDate: "",
    completeDate: "",
    createDate: "",
  },
];
