import "server-only";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "mab_session_token";
const ACCOUNT_COOKIE = "mab_session_account";

export type SessionAccount = {
  userId: string;
  accountId: string;
  email: string;
};

export type Session = {
  token: string;
  account: SessionAccount;
};

// Backend JWTs are 1h-expiry (see money-across-borders' JWT_IMPLEMENTATION.md)
// with no refresh flow — reading `exp` off the token itself, rather than
// hardcoding 60min here, keeps the cookie's lifetime tied to what the
// backend actually issued.
function readTokenExpiry(token: string): Date | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
    };
    return typeof decoded.exp === "number" ? new Date(decoded.exp * 1000) : null;
  } catch {
    return null;
  }
}

export async function createSession(token: string, account: SessionAccount): Promise<void> {
  const cookieStore = await cookies();
  const expires = readTokenExpiry(token) ?? new Date(Date.now() + 60 * 60 * 1000);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };

  cookieStore.set(TOKEN_COOKIE, token, cookieOptions);
  cookieStore.set(ACCOUNT_COOKIE, JSON.stringify(account), cookieOptions);
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  const accountRaw = cookieStore.get(ACCOUNT_COOKIE)?.value;

  if (!token || !accountRaw) return null;

  try {
    const account = JSON.parse(accountRaw) as SessionAccount;
    return { token, account };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(ACCOUNT_COOKIE);
}
