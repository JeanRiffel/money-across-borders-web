import { requireSession } from "@/lib/dal";
import { SendRemittanceForm } from "@/components/forms/send-remittance-form";

export default async function SendRemittancePage() {
  const session = await requireSession();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Send money</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">
        Move funds from one wallet&apos;s currency to another&apos;s, converted via the current exchange
        rate.
      </p>
      <SendRemittanceForm defaultSenderAccountId={session.account.accountId} />
    </div>
  );
}
