import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "matrimony_session";

const publicPaths = ["/", "/login", "/register", "/verify-otp", "/plans", "/contact"];

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const userId = await getUserId(request);
  const isPublic = publicPaths.includes(pathname);

  const isProtected =
    pathname.startsWith("/home") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/preferences") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/profiles") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/interests") ||
    pathname.startsWith("/chats") ||
    pathname === "/plan" ||
    pathname.startsWith("/plan/") ||
    pathname.startsWith("/settings");

  if (!userId && isProtected) {
    const url = request.nextUrl.clone();
    const nextPath = `${pathname}${request.nextUrl.search}`;
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(nextPath)}`;
    return NextResponse.redirect(url);
  }

  if (userId && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!userId && !isPublic && pathname !== "/onboarding") {
    // Allow other future public pages only if listed; otherwise require auth for /home etc.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
