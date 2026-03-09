import { AccountSetupPageView } from "@/components/views/account-setup";

export default async function AccountSetupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <AccountSetupPageView token={token} />;
}
