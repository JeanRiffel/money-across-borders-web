"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wallets/new", label: "Open Wallet" },
  { href: "/kyc", label: "KYC" },
  { href: "/remittances/new", label: "Send Money" },
  { href: "/remittances", label: "History" },
];

export function NavBar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-primary/50 bg-background/95 sticky top-0 z-10 border-b-2 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/dashboard" className="font-mono text-sm font-semibold tracking-tight">
          Money Across Borders
        </Link>
        <nav className="flex flex-1 flex-wrap gap-x-4 gap-y-1 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                pathname === link.href && "text-primary font-medium"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground hidden font-mono text-xs sm:inline">{email}</span>
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout} disabled={loggingOut}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
