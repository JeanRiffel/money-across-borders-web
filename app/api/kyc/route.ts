import { NextResponse } from "next/server";
import { backendFetch, newIdempotencyKey } from "@/lib/api/backend-client";
import { errorResponse, parseJsonBody, requireApiSession } from "@/lib/api/route-helpers";
import { submitKycSchema, type SubmitKycOutput } from "@/lib/schemas/kyc";

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  try {
    const parsed = await parseJsonBody(request, submitKycSchema);
    if (parsed.response) return parsed.response;

    const profile = await backendFetch<SubmitKycOutput>("/kyc", {
      method: "POST",
      token: auth.session.token,
      idempotencyKey: newIdempotencyKey(),
      body: parsed.data,
    });

    return NextResponse.json(profile);
  } catch (error) {
    return errorResponse(error);
  }
}
