import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-primary font-mono text-sm">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Button render={<Link href="/dashboard" />}>Back to dashboard</Button>
    </main>
  );
}
