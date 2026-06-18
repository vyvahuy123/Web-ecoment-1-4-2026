import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/dang-nhap", request.url));
    }

    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      const roles =
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
        payload.role ??
        payload.roles ??
        [];
      const roleList = Array.isArray(roles) ? roles : [roles];

      if (!roleList.includes("Admin")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/dang-nhap", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
