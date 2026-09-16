"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { REMITTANCE_STATUSES, type SearchRemittancesOutput } from "@/lib/schemas/remittance";
import { RemittanceTable } from "@/components/remittances/remittance-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldLabel } from "@/components/ui/field";

async function fetchRemittances(params: Record<string, string | undefined>): Promise<SearchRemittancesOutput> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }

  const response = await fetch(`/api/remittances?${query.toString()}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "Failed to load remittances");
  }

  return data as SearchRemittancesOutput;
}

const STATUS_ALL = "all";

export function RemittanceSearch({ accountId }: { accountId: string }) {
  const [status, setStatus] = React.useState<string>(STATUS_ALL);
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const params = {
    accountId,
    status: status === STATUS_ALL ? undefined : status,
    from: from ? new Date(`${from}T00:00:00.000Z`).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59.999Z`).toISOString() : undefined,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["remittances", params],
    queryFn: () => fetchRemittances(params),
    // Search is Elasticsearch-backed and only catches up once the
    // remittance-indexer worker consumes the completion event — poll so a
    // just-sent remittance shows up without a manual refresh.
    refetchInterval: 5000,
  });

  const remittances = data?.remittances ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-40">
          <FieldLabel htmlFor="status-filter">Status</FieldLabel>
          <Select value={status} onValueChange={(value) => setStatus(value ?? STATUS_ALL)}>
            <SelectTrigger id="status-filter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={STATUS_ALL}>All</SelectItem>
              {REMITTANCE_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field className="w-44">
          <FieldLabel htmlFor="from-filter">From</FieldLabel>
          <Input id="from-filter" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field className="w-44">
          <FieldLabel htmlFor="to-filter">To</FieldLabel>
          <Input id="to-filter" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
        <Button variant="outline" size="icon" aria-label="Refresh" onClick={() => refetch()}>
          <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      ) : isError ? (
        <div className="border-destructive/50 text-destructive rounded-lg border p-6 text-center text-sm">
          {error instanceof Error ? error.message : "Failed to load remittances"}
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        </div>
      ) : remittances.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          No remittances found. Sent one recently? Indexing can take a few seconds — it&apos;ll show up
          here automatically.
        </div>
      ) : (
        <RemittanceTable remittances={remittances} viewerAccountId={accountId} />
      )}
    </div>
  );
}
