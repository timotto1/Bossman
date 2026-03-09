/*eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain*/

"use client";

import { useCallback, useEffect, useState } from "react";

import { LeadHeader } from "@/components/dashboard/lead/lead-header";
import { LeadOverview } from "@/components/dashboard/lead/lead-overview";
import { ProfileCard } from "@/components/dashboard/lead/profile-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResidentFinancialInformation,
  ResidentMortgageInformation,
  ResidentOutgoings,
  ResidentOwnership,
  ResidentPersonalInformation,
  ResidentTenancyInformation,
  ResidentTransactionInformation,
} from "@/types/types";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function LeadContainer({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(true);

  const [residentOwnership, setResidentOwnership] =
    useState<ResidentOwnership | null>(null);
  const [residentOutgoings, setResidentOutgoings] =
    useState<ResidentOutgoings | null>(null);
  const [personalInformation, setPersonalInformation] =
    useState<ResidentPersonalInformation | null>(null);
  const [financialInformation, setFinancialInformation] =
    useState<ResidentFinancialInformation | null>(null);
  const [tenancyInformation, setTenancyInformation] =
    useState<ResidentTenancyInformation | null>(null);
  const [mortgageInformation, setMortgageInformation] =
    useState<ResidentMortgageInformation | null>(null);
  const [transactionInformation, setTransactionInformation] =
    useState<ResidentTransactionInformation | null>(null);
  const [marketingPreferences, setMarketingPreferences] = useState<{
    allow_post: boolean;
    allow_email: boolean;
    allow_sms: boolean;
    allow_phone: boolean;
  } | null>(null);

  const getResidentOwnership = useCallback(async () => {
    const { data, error } = await supabase.rpc("platform_resident_ownership", {
      resident: id,
    });

    if (error) throw new Error(error.message);

    setResidentOwnership(data?.[0]);
  }, [id]);

  const getResidentOutgoings = useCallback(async () => {
    const { data, error } = await supabase.rpc("platform_resident_outgoings", {
      resident: id,
    });

    if (error) throw new Error(error.message);

    setResidentOutgoings(data?.[0]);
  }, [id]);

  const getResidentPersonalInformation = useCallback(async () => {
    const { data, error } = await supabase.rpc(
      "platform_resident_personal_information",
      {
        resident: id,
      },
    );

    if (error) throw new Error(error.message);

    setPersonalInformation(data?.[0]);
  }, [id]);

  const getResidentFinancialInformation = useCallback(async () => {
    const { data, error } = await supabase.rpc(
      "platform_resident_financial_information",
      {
        resident: id,
      },
    );

    if (error) throw new Error(error.message);

    setFinancialInformation(data?.[0]);
  }, [id]);

  const getResidentTenancyInformation = useCallback(async () => {
    const { data, error } = await supabase.rpc(
      "platform_resident_tenancy_information",
      {
        resident: id,
      },
    );

    if (error) throw new Error(error.message);

    setTenancyInformation(data?.[0]);
  }, [id]);

  const getResidentMortgageInformation = useCallback(async () => {
    const { data, error } = await supabase.rpc(
      "platform_resident_mortgage_information",
      {
        resident: id,
      },
    );

    if (error) throw new Error(error.message);

    setMortgageInformation(data?.[0]);
  }, [id]);

  const getResidentTransactionInformation = useCallback(async () => {
    const { data, error } = await supabase.rpc(
      "platform_resident_transaction_information",
      {
        resident: id,
      },
    );

    if (error) throw new Error(error.message);

    setTransactionInformation(data?.[0]);
  }, [id]);

  const getResidentMarketingPreferences = useCallback(async () => {
    const { data, error } = await supabase.rpc(
      "platform_resident_gdpr_preferences",
      {
        resident: id,
      },
    );

    if (error) throw new Error(error.message);

    setMarketingPreferences(data?.[0]);
  }, [id]);

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        await Promise.all([
          getResidentOwnership(),
          getResidentOutgoings(),
          getResidentPersonalInformation(),
          getResidentFinancialInformation(),
          getResidentTenancyInformation(),
          getResidentMortgageInformation(),
          getResidentTransactionInformation(),
          getResidentMarketingPreferences(),
        ]);
      } catch (error) {
        console.error("Error fetching lead data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadData();
  }, [
    getResidentOwnership,
    getResidentOutgoings,
    getResidentPersonalInformation,
    getResidentFinancialInformation,
    getResidentTenancyInformation,
    getResidentMortgageInformation,
    getResidentTransactionInformation,
    getResidentMarketingPreferences,
  ]);

  if (isLoading) {
    return (
      <div className="space-y-8 px-8 py-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const capitalize = (text?: string) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : "N/A";

  const formatCurrency = (value?: number) =>
    value
      ? `£${value?.toLocaleString("en-GB", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })}`
      : "£0";

  //const formattedUnitData = unitData?.type?.split("_").join(" ");

  return (
    <div className="space-y-2">
      <LeadHeader {...personalInformation!} />
      <LeadOverview
        residentOutgoings={residentOutgoings}
        residentOwnership={residentOwnership}
      />

      <div className="flex flex-col gap-4 md:flex-row md:gap-8 py-2 px-8">
        <div className="flex-1 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
          <ProfileCard
            title="Personal Information"
            items={[
              {
                title: "First Name",
                value: capitalize(personalInformation?.first_name),
              },
              {
                title: "Last Name",
                value: capitalize(personalInformation?.last_name),
              },
              {
                title: "Phone Number",
                value: "Not Available",
              },
              {
                title: "Email",
                value: personalInformation?.email || "Not Available",
              },
              {
                title: "Status",
                value: capitalize(personalInformation?.status),
              },
              {
                title: "Signed up date",
                value: personalInformation?.signed_up_date
                  ? new Date(
                      personalInformation?.signed_up_date,
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "Not Available",
              },
            ]}
          />

          <ProfileCard
            title="Financial Information"
            items={[
              {
                title: "Maximum Affordable Share",
                value: transactionInformation?.maximum_share
                  ? `${transactionInformation?.maximum_share}%`
                  : "Not Available",
              },
              {
                title: "Current Savings",
                value: formatCurrency(financialInformation?.cash_savings!),
              },
              {
                title: "Next Raise",
                value: "Not Available",
              },
              {
                title: "Salary",
                value: formatCurrency(
                  financialInformation?.annual_household_income ?? 0,
                ),
              },
            ]}
          />

          <ProfileCard
            title="Tenancy Information"
            items={[
              {
                title: "Move-in Date",
                value: tenancyInformation?.purchase_date
                  ? new Date(
                      tenancyInformation.purchase_date,
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "Not Available",
              },
              {
                title: "Street Address",
                value: tenancyInformation?.address_1 || "Not Available",
              },
              {
                title: "City",
                value: tenancyInformation?.city || "Not Available",
              },
              {
                title: "County",
                value: tenancyInformation?.county || "Not Available",
              },
              {
                title: "Property Type",
                value: tenancyInformation?.unit_type
                  ? `${tenancyInformation?.unit_type?.charAt(0).toUpperCase() + tenancyInformation?.unit_type?.slice(1).split("_").join(" ")}`
                  : "Not Available",
              },
              {
                title: "Postcode",
                value: tenancyInformation?.postcode || "Not Available",
              },
            ]}
          />

          <ProfileCard
            title="Mortgage Information"
            items={[
              {
                title: "Mortgage Amount",
                value: mortgageInformation?.mortgage_amount
                  ? formatCurrency(mortgageInformation?.mortgage_amount!)
                  : "Not Available",
              },
              {
                title: "Mortgage Expiry Date",
                value: mortgageInformation?.mortgage_expiry_date
                  ? new Date(
                      mortgageInformation?.mortgage_expiry_date,
                    ).toLocaleDateString("en-GB")
                  : "Not Available",
              },
              {
                title: "Mortgage Rate",
                value: mortgageInformation?.mortgage_rate
                  ? `${mortgageInformation?.mortgage_rate}%`
                  : "Not Available",
              },
              {
                title: "Mortgage Term",
                value: `${mortgageInformation?.mortgage_term ? `${mortgageInformation?.mortgage_term} years` : "Not Available"}`,
              },
              {
                title: "Monthly Mortgage Cost",
                value: mortgageInformation?.monthly_mortgage_payment
                  ? formatCurrency(
                      mortgageInformation?.monthly_mortgage_payment!,
                    )
                  : "Not Available",
              },
              {
                title: "Current Lender",
                value: mortgageInformation?.current_lender
                  ? `${mortgageInformation?.current_lender}`
                  : "Not Available",
              },
            ]}
          />

          <ProfileCard
            title="Marketing preferences"
            items={[
              {
                title: "Email Consent",
                value: marketingPreferences?.allow_email
                  ? "Subscribed"
                  : "Unsubscribed",
              },
              {
                title: "Telephone Consent",
                value: marketingPreferences?.allow_phone
                  ? "Subscribed"
                  : "Unsubscribed",
              },
              {
                title: "Text Consent",
                value: marketingPreferences?.allow_sms
                  ? "Subscribed"
                  : "Unsubscribed",
              },
              {
                title: "Post Consent",
                value: marketingPreferences?.allow_post
                  ? "Subscribed"
                  : "Unsubscribed",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
