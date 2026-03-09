export type Development = {
  id: number;
  name: string;
  created_at: Date;
  postcode: string;
  city: string;
  is_shared_ownership: boolean;
  is_help_to_buy: boolean;
  housing_provider: string;
  completion_date: string;
  management_company: string;
  address: string;
};

export type Unit = {
  id: number;
  internal_id: string;
  development_id: number;
  address_1: string;
  address_2: string;
  address_3: string;
  city: string;
  county: string;
  postcode: string;
  status: string;
  unitType: string;
  rent: number;
  occupant: string | null;
};

export type ResidentOwnership = {
  purchase_price: number;
  percentage_sold: number;
};

export type ResidentOutgoings = {
  monthly_income: number;
  monthly_rent: number;
  service_charge: number;
  monthly_mortgage_payment: number;
  debt: number;
  total_monthly_costs: number;
};

export type ResidentPersonalInformation = {
  first_name: string;
  last_name: string;
  status: string;
  email: string;
  address: string;
  company_development_unit_id: number;
  signed_up_date: Date;
};

export type ResidentFinancialInformation = {
  cash_savings: number;
  annual_household_income: number;
};

export type ResidentMortgageInformation = {
  mortgage_amount: number;
  mortgage_expiry_date: Date;
  mortgage_rate: number;
  mortgage_term: number;
  monthly_mortgage_payment: number;
  current_lender: string;
};

export type ResidentTransactionInformation = {
  current_share: number;
  maximum_share: number;
};

export type ResidentTenancyInformation = {
  purchase_date: Date;
  address_1: string;
  city: string;
  county: string;
  unit_type: string;
  postcode: string;
};

export type DevelopmentListing = {
  id: string;
  development_name: string;
  postcode: string;
  city: string;
  address_1: string;
  type: string;
  scheme: "shared_ownership" | "help_to_buy";
  listing_type: string;
  development_description: string;
  developer_name: string;
  brochure_url: string;
  completion_date: string;
  development_summary: string;
  criteria: string;
  rightmove_listing_url: string;
  zoopla_listing_url: string;
  on_the_market_listing_url: string;
  share_to_buy_listing_url: string;
  rightmove_status: string;
  zoopla_status: string;
  on_the_market_status: string;
  share_to_buy_status: string;
  minimum_share: number;
  minimum_deposit: number;
  created_at: string;
  updated_at: string;
  youtube_url: string;
  vimeo_url: string;
  virtual_tour_supplier: string;
  virtual_tour_url: string;
  key_information_url: string;
};

export type ListingCompletion = {
  complete: boolean;
  percentage: number;
  sections: {
    attachments: {
      complete: boolean;
      fields: {
        brochure: boolean;
        energy_cert: boolean;
        floor_plan: boolean;
        kid: boolean;
        price_list: boolean;
      };
      percentage: number;
    };
    media: {
      complete: boolean;
      fields: {
        has_media: boolean;
      };
      percentage: number;
    };
    overview: {
      complete: boolean;
      fields: {
        criteria: boolean;
        development_name: boolean;
        minimum_deposit: boolean;
        minimum_share: boolean;
        scheme: boolean;
      };
      percentage: number;
    };
    units: {
      complete: boolean;
      fields: {
        has_unit_listings: boolean;
      };
      percentage: number;
    };
  };
};

//partial fields - add more if needed
export interface UnitListing extends DevelopmentListing {
  id: string;
  unit_type: string;
  address_1: string;
  address_2: string;
  address_3: string;
  town: string;
  property_value: number;
  monthly_rent: number;
  ground_rent: number;
  service_charge: number;
  size: number;
  bedroom_number: number;
  bathroom_number: number;
  unit_description: string;
}

export type ListingDocument = {
  id: string;
  document_name: string;
  document_type: string;
  document_size: number;
  supabase_path: string;
  created_at: string;
};
