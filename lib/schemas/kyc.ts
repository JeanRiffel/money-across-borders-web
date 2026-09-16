import { z } from "zod";

// Mirrors SubmitKycInput. Attachments are omitted from the form — this MVP
// auto-verifies synchronously and doesn't need real file upload to
// demonstrate the flow.
export const submitKycSchema = z.object({
  accountId: z.string().uuid("Must be a valid account ID"),
  fullName: z.string().min(1, "Full name is required"),
  documentId: z.string().min(1, "Document ID is required"),
  documentType: z.string().min(1).optional(),
  notes: z.string().optional(),
});

export type SubmitKycValues = z.infer<typeof submitKycSchema>;

export type SubmitKycOutput = {
  kycProfileId: string;
  accountId: string;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
};
