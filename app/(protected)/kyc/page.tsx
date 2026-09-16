import { requireSession } from "@/lib/dal";
import { SubmitKycForm } from "@/components/forms/submit-kyc-form";

export default async function KycPage() {
  const session = await requireSession();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Submit KYC</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">
        Verify an account so it can send remittances above the unverified sender limit.
      </p>
      <SubmitKycForm defaultAccountId={session.account.accountId} />
    </div>
  );
}
