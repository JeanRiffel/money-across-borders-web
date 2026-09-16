"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { submitKycSchema, type SubmitKycValues, type SubmitKycOutput } from "@/lib/schemas/kyc";
import { formatDateTime } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SubmitKycForm({ defaultAccountId }: { defaultAccountId: string }) {
  const router = useRouter();
  const [result, setResult] = React.useState<SubmitKycOutput | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubmitKycValues>({
    resolver: zodResolver(submitKycSchema),
    defaultValues: { accountId: defaultAccountId },
  });

  async function onSubmit(values: SubmitKycValues) {
    const response = await fetch("/api/kyc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(data?.message ?? "Failed to submit KYC");
      return;
    }

    toast.success("KYC verified");
    setResult(data as SubmitKycOutput);
  }

  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            KYC profile submitted
            <Badge variant="outline" className="border-success text-success">
              {result.status}
            </Badge>
          </CardTitle>
          <CardDescription>
            This MVP auto-verifies every submission synchronously — no real document review happens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-sm">
            <dt className="text-muted-foreground">Profile ID</dt>
            <dd className="truncate">{result.kycProfileId}</dd>
            <dt className="text-muted-foreground">Account ID</dt>
            <dd className="truncate">{result.accountId}</dd>
            {result.verifiedAt && (
              <>
                <dt className="text-muted-foreground">Verified at</dt>
                <dd>{formatDateTime(result.verifiedAt)}</dd>
              </>
            )}
          </dl>
          <Button onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
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
        <Field data-invalid={!!errors.fullName}>
          <FieldLabel htmlFor="fullName">Full legal name</FieldLabel>
          <Input id="fullName" {...register("fullName")} />
          <FieldError errors={[errors.fullName]} />
        </Field>
        <Field data-invalid={!!errors.documentId}>
          <FieldLabel htmlFor="documentId">Document ID</FieldLabel>
          <Input id="documentId" placeholder="PASSPORT-123456" {...register("documentId")} />
          <FieldError errors={[errors.documentId]} />
        </Field>
        <Field data-invalid={!!errors.documentType}>
          <FieldLabel htmlFor="documentType">Document type (optional)</FieldLabel>
          <Input id="documentType" placeholder="PASSPORT" {...register("documentType")} />
          <FieldError errors={[errors.documentType]} />
        </Field>
        <Field data-invalid={!!errors.notes}>
          <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
          <Textarea id="notes" rows={3} {...register("notes")} />
          <FieldDescription>
            Above the 100000 minor-unit unverified-sender threshold, a remittance needs this on file.
          </FieldDescription>
          <FieldError errors={[errors.notes]} />
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit KYC"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
