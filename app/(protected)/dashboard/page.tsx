import Link from "next/link";
import { Wallet, ShieldCheck, Send, History, ArrowRight } from "lucide-react";

import { requireSession } from "@/lib/dal";
import { CopyableId } from "@/components/copyable-id";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ACTIONS = [
  {
    href: "/wallets/new",
    icon: Wallet,
    title: "Open a wallet",
    description: "Provision a currency-denominated wallet for an account.",
  },
  {
    href: "/kyc",
    icon: ShieldCheck,
    title: "Submit KYC",
    description: "Verify an account so it can send above the unverified limit.",
  },
  {
    href: "/remittances/new",
    icon: Send,
    title: "Send money",
    description: "Move funds from one wallet's currency to another's.",
  },
  {
    href: "/remittances",
    icon: History,
    title: "Remittance history",
    description: "Search past remittances by account, status, and date.",
  },
] as const;

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Signed in as {session.account.email}. The backend has no account/wallet lookup endpoint, so
          your account ID below is what every other action needs — keep it handy.
        </p>
      </div>

      <CopyableId label="Your account ID" value={session.account.accountId} />

      <div className="grid gap-4 sm:grid-cols-2">
        {ACTIONS.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:border-primary/50 h-full transition-colors">
              <CardHeader>
                <action.icon className="text-primary size-5" />
                <CardTitle className="flex items-center justify-between">
                  {action.title}
                  <ArrowRight className="text-muted-foreground size-4" />
                </CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
