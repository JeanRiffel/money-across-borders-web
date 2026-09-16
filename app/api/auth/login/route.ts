import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend-client";
import { errorResponse, parseJsonBody } from "@/lib/api/route-helpers";
import { createSession } from "@/lib/session";
import { loginSchema, type LoginOutput } from "@/lib/schemas/auth";

export async function POST(request: Request) {
  try {
    const parsed = await parseJsonBody(request, loginSchema);
    if (parsed.response) return parsed.response;
    const { email, password } = parsed.data;

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
