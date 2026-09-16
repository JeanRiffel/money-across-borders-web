import { NextResponse } from "next/server";
import { backendFetch, newIdempotencyKey } from "@/lib/api/backend-client";
import { errorResponse, parseJsonBody } from "@/lib/api/route-helpers";
import { createSession } from "@/lib/session";
import { signupSchema, type CreateAccountOutput } from "@/lib/schemas/account";
import type { LoginOutput } from "@/lib/schemas/auth";

export async function POST(request: Request) {
  try {
    const parsed = await parseJsonBody(request, signupSchema);
    if (parsed.response) return parsed.response;
    const { email, password } = parsed.data;

    await backendFetch<CreateAccountOutput>("/account", {
      method: "POST",
      idempotencyKey: newIdempotencyKey(),
      body: { email, password },
    });

    // POST /account mints no token — log in right away so signup lands the
    // user in an authenticated session instead of bouncing them to /login.
    const login = await backendFetch<LoginOutput>("/login", {
      method: "POST",
      body: { email, password },
    });

    await createSession(login.token, {
      userId: login.userId,
      accountId: login.accountId,
      email: login.email,
    });

    return NextResponse.json({ account: { accountId: login.accountId, email: login.email } });
  } catch (error) {
    return errorResponse(error);
  }
}
