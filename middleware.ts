import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
const PUBLIC_ROUTES = ["/", "/public"];

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

// Supabase auth-helpers stores the session in sb-<project-ref>-auth-token
// The project ref is the subdomain of the Supabase URL.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const projectRef = supabaseUrl.replace(/^https?:\/\//, "").split(".")[0];

function hasSession(request: NextRequest): boolean {
  const base = `sb-${projectRef}-auth-token`;
  // auth-helpers may chunk the token as .0, .1, ... for large JWTs
  return !!(request.cookies.get(base)?.value ?? request.cookies.get(`${base}.0`)?.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = hasSession(request);

  // Unauthenticated user hitting a protected route → send to login
  if (!isAuthRoute(pathname) && !isPublicRoute(pathname) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting an auth page → send to dashboard
  if (isAuthRoute(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp|.*\\.ico).*)"
  ]
};
