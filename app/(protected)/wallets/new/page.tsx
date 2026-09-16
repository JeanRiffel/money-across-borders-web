import { requireSession } from "@/lib/dal";
import { OpenWalletForm } from "@/components/forms/open-wallet-form";

export default async function OpenWalletPage() {
  const session = await requireSession();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Open a wallet</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">
        Provision a currency-denominated wallet for an account. Use your own account ID, or a
        recipient&apos;s if you&apos;re setting up someone to receive money.
      </p>
      <OpenWalletForm defaultAccountId={session.account.accountId} />
    </div>
  );
}
