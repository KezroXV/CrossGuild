import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROUTES = ["/admin"];
const PROTECTED_ROUTES = ["/profile", "/settings"];
const AUTH_ROUTES = ["/login"];

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/auth/signin" || pathname.startsWith("/auth/signin/")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });
  const isLoggedIn = !!token;

  if (matchesRoute(pathname, AUTH_ROUTES) && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const requiresAuth =
    matchesRoute(pathname, ADMIN_ROUTES) ||
    matchesRoute(pathname, PROTECTED_ROUTES);

  if (requiresAuth && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
