import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get user from session/auth (null if not logged in)
  const user = await stackServerApp.getUser();

  // If user is logged in and accessing '/', redirect to /dashboard
  if (pathname === "/" && user?.id !== undefined) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // If not logged in and accessing /dashboard, redirect to /
  if (pathname === "/dashboard" && user?.id === undefined) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Otherwise allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard"],
};
