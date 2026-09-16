"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-destructive font-mono text-sm">Error</p>
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        An unexpected error occurred while rendering this page.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}
