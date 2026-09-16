import { requireSession } from "@/lib/dal";
import { RemittanceSearch } from "@/components/remittances/remittance-search";

export default async function RemittanceHistoryPage() {
  const session = await requireSession();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Remittance history</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">
        Remittances where you&apos;re the sender or the recipient.
      </p>
      <RemittanceSearch accountId={session.account.accountId} />
    </div>
  );
}
