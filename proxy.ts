import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const routeRoles: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/dashboard", roles: ["admin", "veterinarian", "receptionist"] },
  { prefix: "/clients", roles: ["admin", "receptionist"] },
  { prefix: "/pets", roles: ["admin", "veterinarian", "receptionist"] },
  { prefix: "/appointments", roles: ["admin", "veterinarian", "receptionist"] },
  { prefix: "/clinic", roles: ["admin"] },
  { prefix: "/settings", roles: ["admin"] },
  { prefix: "/team", roles: ["admin"] },
];

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const protectedRoute = routeRoles.find((route) => request.nextUrl.pathname.startsWith(route.prefix));
  if (protectedRoute && token.role && !protectedRoute.roles.includes(token.role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/clients/:path*", "/pets/:path*", "/appointments/:path*", "/clinic/:path*", "/settings/:path*", "/team/:path*"],
};
