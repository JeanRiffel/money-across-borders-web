import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/lib/money";

// Mirrors OpenWalletInput. Backend accepts any 3-letter currency code and
// rejects unsupported ones downstream (UnsupportedCurrencyError); the enum
// here just scopes the picker to what's actually usable end-to-end today.
export const openWalletSchema = z.object({
  accountId: z.string().uuid("Must be a valid account ID"),
  currency: z.enum(SUPPORTED_CURRENCIES),
  initialBalanceMinorUnits: z.coerce.number().int().nonnegative().default(0),
});

export type OpenWalletFormInput = z.input<typeof openWalletSchema>;
export type OpenWalletValues = z.infer<typeof openWalletSchema>;

export type OpenWalletOutput = {
  walletId: string;
  accountId: string;
  currency: string;
  balanceMinorUnits: number;
  status: string;
  createdAt: string;
};
