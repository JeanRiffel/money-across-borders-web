import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/lib/money";

// Mirrors SendRemittanceInput exactly (uuid ids, positive integer amount).
export const sendRemittanceSchema = z.object({
  senderAccountId: z.string().uuid("Must be a valid account ID"),
  recipientAccountId: z.string().uuid("Must be a valid account ID"),
  sourceCurrency: z.enum(SUPPORTED_CURRENCIES),
  destinationCurrency: z.enum(SUPPORTED_CURRENCIES),
  amountMinorUnits: z.coerce.number().int().positive("Enter an amount greater than zero"),
});

export type SendRemittanceFormInput = z.input<typeof sendRemittanceSchema>;
export type SendRemittanceValues = z.infer<typeof sendRemittanceSchema>;

export type SendRemittanceOutput = {
  remittanceId: string;
  status: string;
  sourceCurrency: string;
  destinationCurrency: string;
  sourceAmountMinorUnits: number;
  feeMinorUnits: number;
  convertedAmountMinorUnits: number;
  exchangeRate: number;
  createdAt: string;
};

// Backend leaves status/from/to unconstrained (SearchRemittancesInput), but
// these are the only statuses a remittance can actually reach — scoping the
// filter to them here is a UI nicety, not a contract rule.
export const REMITTANCE_STATUSES = [
  "COMPLETED",
  "REJECTED_COMPLIANCE",
  "REJECTED_INSUFFICIENT_FUNDS",
  "FAILED",
] as const;

export const searchRemittancesSchema = z.object({
  accountId: z.string().uuid("Must be a valid account ID"),
  status: z.enum(REMITTANCE_STATUSES).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type SearchRemittancesValues = z.infer<typeof searchRemittancesSchema>;

export type RemittanceSearchDocument = {
  remittanceId: string;
  senderAccountId: string;
  recipientAccountId: string;
  status: string;
  sourceCurrency: string;
  sourceAmountMinorUnits: number;
  feeMinorUnits: number;
  destinationCurrency: string;
  convertedAmountMinorUnits: number;
  exchangeRate: number;
  createdAt: string;
};

export type SearchRemittancesOutput = {
  remittances: RemittanceSearchDocument[];
};
