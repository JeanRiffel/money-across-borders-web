import { NextResponse } from "next/server";
import { backendFetch, newIdempotencyKey } from "@/lib/api/backend-client";
import { errorResponse, parseJsonBody, requireApiSession } from "@/lib/api/route-helpers";
import { openWalletSchema, type OpenWalletOutput } from "@/lib/schemas/wallet";

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  try {
    const parsed = await parseJsonBody(request, openWalletSchema);
    if (parsed.response) return parsed.response;

    const wallet = await backendFetch<OpenWalletOutput>("/wallets", {
      method: "POST",
      token: auth.session.token,
      idempotencyKey: newIdempotencyKey(),
      body: parsed.data,
    });

    return NextResponse.json(wallet);
  } catch (error) {
    return errorResponse(error);
  }
}
