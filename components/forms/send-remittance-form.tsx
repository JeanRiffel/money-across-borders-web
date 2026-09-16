"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  sendRemittanceSchema,
  type SendRemittanceFormInput,
  type SendRemittanceValues,
  type SendRemittanceOutput,
} from "@/lib/schemas/remittance";
import { SUPPORTED_CURRENCIES, formatMinorUnits } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SendRemittanceForm({ defaultSenderAccountId }: { defaultSenderAccountId: string }) {
  const router = useRouter();
  const [result, setResult] = React.useState<SendRemittanceOutput | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SendRemittanceFormInput, unknown, SendRemittanceValues>({
    resolver: zodResolver(sendRemittanceSchema),
    defaultValues: {
      senderAccountId: defaultSenderAccountId,
      recipientAccountId: "",
      sourceCurrency: "USD",
      destinationCurrency: "BRL",
      amountMinorUnits: 0,
    },
  });

  const sourceCurrency = watch("sourceCurrency");
  const destinationCurrency = watch("destinationCurrency");

  async function onSubmit(values: SendRemittanceValues) {
    const response = await fetch("/api/remittances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(data?.message ?? "Failed to send remittance");
      return;
    }

    toast.success("Remittance sent");
    setResult(data as SendRemittanceOutput);
  }

  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Remittance {result.status.toLowerCase()}</CardTitle>
          <CardDescription>
            It can take a few seconds to show up on the history page (search indexing runs
            asynchronously).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-sm">
            <dt className="text-muted-foreground">Remittance ID</dt>
            <dd className="truncate">{result.remittanceId}</dd>
            <dt className="text-muted-foreground">Sent</dt>
            <dd>{formatMinorUnits(result.sourceAmountMinorUnits, result.sourceCurrency)}</dd>
            <dt className="text-muted-foreground">Fee</dt>
            <dd>{formatMinorUnits(result.feeMinorUnits, result.sourceCurrency)}</dd>
            <dt className="text-muted-foreground">Received</dt>
            <dd>{formatMinorUnits(result.convertedAmountMinorUnits, result.destinationCurrency)}</dd>
            <dt className="text-muted-foreground">Exchange rate</dt>
            <dd>{result.exchangeRate}</dd>
          </dl>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setResult(null)}>
              Send another
            </Button>
            <Button onClick={() => router.push("/remittances")}>View history</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.senderAccountId}>
          <FieldLabel htmlFor="senderAccountId">Sender account ID</FieldLabel>
          <Input id="senderAccountId" {...register("senderAccountId")} />
          <FieldError errors={[errors.senderAccountId]} />
        </Field>
        <Field data-invalid={!!errors.recipientAccountId}>
          <FieldLabel htmlFor="recipientAccountId">Recipient account ID</FieldLabel>
          <Input id="recipientAccountId" {...register("recipientAccountId")} />
          <FieldDescription>
            The recipient must already have a wallet open in the destination currency.
          </FieldDescription>
          <FieldError errors={[errors.recipientAccountId]} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!errors.sourceCurrency}>
            <FieldLabel htmlFor="sourceCurrency">From currency</FieldLabel>
            <Select
              value={sourceCurrency}
              onValueChange={(value) =>
                setValue("sourceCurrency", value as SendRemittanceValues["sourceCurrency"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="sourceCurrency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.sourceCurrency]} />
          </Field>
          <Field data-invalid={!!errors.destinationCurrency}>
            <FieldLabel htmlFor="destinationCurrency">To currency</FieldLabel>
            <Select
              value={destinationCurrency}
              onValueChange={(value) =>
                setValue("destinationCurrency", value as SendRemittanceValues["destinationCurrency"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="destinationCurrency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.destinationCurrency]} />
          </Field>
        </div>
        <Field data-invalid={!!errors.amountMinorUnits}>
          <FieldLabel htmlFor="amountMinorUnits">Amount (minor units)</FieldLabel>
          <Input
            id="amountMinorUnits"
            type="number"
            min={1}
            step={1}
            {...register("amountMinorUnits")}
          />
          <FieldDescription>
            In {sourceCurrency} minor units — e.g. 10000 = {formatMinorUnits(10000, sourceCurrency)}. Above
            100000 requires a VERIFIED KYC profile for the sender.
          </FieldDescription>
          <FieldError errors={[errors.amountMinorUnits]} />
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send remittance"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
