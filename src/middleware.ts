import { NextResponse, type NextRequest } from "next/server";

// Optimistic gate only: cheap redirect when no cookie exists. Real verification (signature,
// expiry, revocation, role) happens server-side in requireStaff()/authorizeApi().
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!req.cookies.get("museum_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
