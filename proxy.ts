import { NextRequest, NextResponse } from "next/server";

// Next.js 16 renamed Middleware to Proxy (same mechanism). This performs an
// optimistic check only — it reads cookie presence, never verifies the JWT
// signature. The backend's authMiddleware is the real gate; this just keeps
// signed-out visitors from loading protected pages before that 401 comes
// back. See node_modules/next/dist/docs/01-app/02-guides/authentication.md.
const SESSION_COOKIE = "mab_session_token";
const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  if (!hasSession && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
