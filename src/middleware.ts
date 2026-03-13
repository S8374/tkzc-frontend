import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get("accessToken")?.value;

  // 🚫 If no token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Protect these routes
export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/users/:path*"],
};