import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminJwt, ADMIN_COOKIE } from "@/lib/admin/session";

/**
 * Edge middleware.
 * - Guards /admin/* (except /admin/login) with admin JWT.
 * - If force_password_change flag set, funnels to /admin/change-password.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only handle /admin/*
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Public admin routes
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const payload = await verifyAdminJwt(token);
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Force password change funnel
  if (payload.fpc && pathname !== "/admin/change-password") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/change-password";
    return NextResponse.redirect(url);
  }

  // Already changed — do not keep showing /admin/change-password
  if (!payload.fpc && pathname === "/admin/change-password") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
