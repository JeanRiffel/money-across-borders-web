import "server-only";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:3000";

// The backend always answers with { statusCode, result } — result is the
// DTO payload on success, or a plain error message string on failure (see
// e.g. CreateAccountController/LoginController in the backend repo).
type BackendEnvelope<T> = { statusCode: number; result: T };

export class BackendApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

type BackendRequestOptions = {
  method?: "GET" | "POST";
  token?: string;
  idempotencyKey?: string;
  body?: unknown;
  searchParams?: Record<string, string | undefined>;
};

export async function backendFetch<T>(path: string, options: BackendRequestOptions = {}): Promise<T> {
  const { method = "GET", token, idempotencyKey, body, searchParams } = options;

  const url = new URL(path, BACKEND_URL);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new BackendApiError(502, "Could not reach the Money Across Borders API. Is it running?");
  }

  const envelope = (await response.json().catch(() => null)) as BackendEnvelope<T> | null;

  if (!response.ok || envelope === null) {
    const message =
      envelope && typeof envelope.result === "string"
        ? envelope.result
        : `Backend request failed with status ${response.status}`;
    throw new BackendApiError(response.status, message);
  }

  return envelope.result;
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}
