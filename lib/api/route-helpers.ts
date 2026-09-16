import { NextResponse } from "next/server";
import type { z } from "zod";
import { BackendApiError } from "@/lib/api/backend-client";
import { getSession, type Session } from "@/lib/session";

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof BackendApiError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ message: "Unexpected server error" }, { status: 500 });
}

type ParsedBody<T> = { data: T; response?: undefined } | { data?: undefined; response: NextResponse };

export async function parseJsonBody<S extends z.ZodTypeAny>(
  request: Request,
  schema: S
): Promise<ParsedBody<z.infer<S>>> {
  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request body";
    return { response: NextResponse.json({ message }, { status: 400 }) };
  }

  return { data: parsed.data };
}

type ApiSession = { session: Session; response?: undefined } | { session?: undefined; response: NextResponse };

// Route-handler counterpart to lib/dal.ts's requireSession(): returns JSON
// instead of redirecting, since these are fetch()ed by client components,
// not navigated to.
export async function requireApiSession(): Promise<ApiSession> {
  const session = await getSession();
  if (!session) {
    return { response: NextResponse.json({ message: "Not authenticated" }, { status: 401 }) };
  }
  return { session };
}
