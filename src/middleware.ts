import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth/server";
import { getUserRole } from "@/lib/auth/server-utils";
import authConfig from "../auth.config";

const LOGIN_PATH = authConfig.ui.redirectAfterLogout;
const DEFAULT_AUTH_PATH = authConfig.ui.redirectAfterLogin;
const protectedPaths: string[] = authConfig.ui.protectedPaths;
const roleRestrictions: Record<string, string[]> = authConfig.ui.roleRestrictions;

export const runtime = "nodejs";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = LOGIN_PATH;
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = getUserRole(session);

    for (const [prefix, allowed] of Object.entries(roleRestrictions)) {
      if (pathname.startsWith(prefix)) {
        if (!userRole || !allowed.includes(userRole)) {
          const fallbackUrl = request.nextUrl.clone();
          fallbackUrl.pathname = DEFAULT_AUTH_PATH;
          return NextResponse.redirect(fallbackUrl);
        }
      }
    }

    return NextResponse.next();
  } catch {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|login|register|verify-email|forgot-password|reset-password|2fa).*)",
  ],
};
