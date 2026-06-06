import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminJwt, ADMIN_COOKIE } from "@/lib/admin/session";

/**
 * Edge middleware.
 *
 * HIGH-02 FIX: Matcher now covers BOTH /admin/* page routes AND /api/admin/*
 * API routes. Previously only page routes were protected; API routes relied
 * solely on individual route-level getCurrentAdmin() calls. Bootstrap (CRIT-02)
 * was exploitable because it had no auth check at all.
 *
 * - /admin/login and /api/admin/login are public (auth endpoints).
 * - /api/admin/bootstrap is public by design (protected by its own secret header).
 * - All other /admin/* and /api/admin/* paths require a valid JWT.
 * - API paths return 401 JSON (not a redirect) when unauthenticated.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPageRoute = pathname.startsWith("/admin");
  const isApiRoute = pathname.startsWith("/api/admin");

  if (!isPageRoute && !isApiRoute) return NextResponse.next();

  // Public paths — no JWT required
  const publicPaths = [
    "/admin/login",
    "/api/admin/login",
    "/api/admin/bootstrap",
  ];
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value;

  if (!token) {
    if (isApiRoute) {
      // Return JSON 401 for API routes (don't redirect)
      return NextResponse.json(
        { ok: false, error: "unauthenticated" },
        { status: 401 }
      );
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const payload = await verifyAdminJwt(token);
  if (!payload) {
    if (isApiRoute) {
      return NextResponse.json(
        { ok: false, error: "invalid_token" },
        { status: 401 }
      );
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Force password change funnel (page routes only — API is still accessible)
  if (payload.fpc && isPageRoute && pathname !== "/admin/change-password") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/change-password";
    return NextResponse.redirect(url);
  }

  // Already changed — don't keep looping to /admin/change-password
  if (!payload.fpc && isPageRoute && pathname === "/admin/change-password") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
