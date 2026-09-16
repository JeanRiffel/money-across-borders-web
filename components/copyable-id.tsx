"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyableId({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="bg-muted/50 flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="truncate font-mono text-sm">{value}</p>
      </div>
      <Button variant="ghost" size="icon" aria-label={`Copy ${label}`} onClick={handleCopy}>
        {copied ? <Check className="text-success size-4" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
}
