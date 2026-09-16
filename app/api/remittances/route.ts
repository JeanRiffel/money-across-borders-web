import { NextRequest, NextResponse } from "next/server";
import { backendFetch, newIdempotencyKey } from "@/lib/api/backend-client";
import { errorResponse, parseJsonBody, requireApiSession } from "@/lib/api/route-helpers";
import {
  sendRemittanceSchema,
  searchRemittancesSchema,
  type SendRemittanceOutput,
  type SearchRemittancesOutput,
} from "@/lib/schemas/remittance";

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  try {
    const parsed = await parseJsonBody(request, sendRemittanceSchema);
    if (parsed.response) return parsed.response;

    const remittance = await backendFetch<SendRemittanceOutput>("/remittances", {
      method: "POST",
      token: auth.session.token,
      idempotencyKey: newIdempotencyKey(),
      body: parsed.data,
    });

    return NextResponse.json(remittance);
  } catch (error) {
    return errorResponse(error);
  }
}

// CQRS read side — backed by Elasticsearch, eventually consistent behind
// the remittance-indexer worker (see AGENTS.md). accountId is required by
// the backend; omitting it there returns 400.
export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const parsed = searchRemittancesSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid query parameters";
    return NextResponse.json({ message }, { status: 400 });
  }

  try {
    const { accountId, status, from, to, limit } = parsed.data;
    const result = await backendFetch<SearchRemittancesOutput>("/remittances", {
      method: "GET",
      token: auth.session.token,
      searchParams: {
        accountId,
        status,
        from,
        to,
        limit: limit !== undefined ? String(limit) : undefined,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
