import { z } from "zod";

// Mirrors CreateAccountInput (backend enforces no password policy beyond
// non-empty) — min(8) here is a client-side UX nicety, not a contract rule.
export const signupSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
});

export type SignupValues = z.infer<typeof signupSchema>;

export type CreateAccountOutput = {
  accountId: string;
  email: string;
  status: string;
  createdAt: string;
};
