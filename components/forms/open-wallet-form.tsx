"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  openWalletSchema,
  type OpenWalletFormInput,
  type OpenWalletValues,
  type OpenWalletOutput,
} from "@/lib/schemas/wallet";
import { SUPPORTED_CURRENCIES, formatMinorUnits } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function OpenWalletForm({ defaultAccountId }: { defaultAccountId: string }) {
  const router = useRouter();
  const [result, setResult] = React.useState<OpenWalletOutput | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OpenWalletFormInput, unknown, OpenWalletValues>({
    resolver: zodResolver(openWalletSchema),
    defaultValues: { accountId: defaultAccountId, currency: "USD", initialBalanceMinorUnits: 0 },
  });

  const currency = watch("currency");

  async function onSubmit(values: OpenWalletValues) {
    const response = await fetch("/api/wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(data?.message ?? "Failed to open wallet");
      return;
    }

    toast.success("Wallet opened");
    setResult(data as OpenWalletOutput);
  }

  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet opened</CardTitle>
          <CardDescription>
            There&apos;s no lookup endpoint for this later — save these details now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-sm">
            <dt className="text-muted-foreground">Wallet ID</dt>
            <dd className="truncate">{result.walletId}</dd>
            <dt className="text-muted-foreground">Account ID</dt>
            <dd className="truncate">{result.accountId}</dd>
            <dt className="text-muted-foreground">Currency</dt>
            <dd>{result.currency}</dd>
            <dt className="text-muted-foreground">Balance</dt>
            <dd>{formatMinorUnits(result.balanceMinorUnits, result.currency)}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd>{result.status}</dd>
          </dl>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setResult(null)}>
              Open another
            </Button>
            <Button onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.accountId}>
          <FieldLabel htmlFor="accountId">Account ID</FieldLabel>
          <Input id="accountId" {...register("accountId")} />
          <FieldError errors={[errors.accountId]} />
        </Field>
        <Field data-invalid={!!errors.currency}>
          <FieldLabel htmlFor="currency">Currency</FieldLabel>
          <Select
            value={currency}
            onValueChange={(value) =>
              setValue("currency", value as OpenWalletValues["currency"], { shouldValidate: true })
            }
          >
            <SelectTrigger id="currency" className="w-full">
              <SelectValue placeholder="Select a currency" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.currency]} />
        </Field>
        <Field data-invalid={!!errors.initialBalanceMinorUnits}>
          <FieldLabel htmlFor="initialBalanceMinorUnits">Initial balance (minor units)</FieldLabel>
          <Input
            id="initialBalanceMinorUnits"
            type="number"
            min={0}
            step={1}
            {...register("initialBalanceMinorUnits")}
          />
          <FieldDescription>
            No funding rail exists yet — this stands in for money already in the wallet. E.g. 100000 ={" "}
            {formatMinorUnits(100000, currency)}.
          </FieldDescription>
          <FieldError errors={[errors.initialBalanceMinorUnits]} />
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Opening wallet…" : "Open wallet"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
