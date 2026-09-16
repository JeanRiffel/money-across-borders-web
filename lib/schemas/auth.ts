import { z } from "zod";

// Mirrors LoginInput exactly — backend just requires non-empty password.
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export type LoginOutput = {
  token: string;
  userId: string;
  accountId: string;
  email: string;
};
