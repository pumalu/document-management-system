import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Check if user is authenticated
  if (!token) {
    // Redirect to login if accessing protected routes
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // Check if admin is accessing admin-only routes
  if (request.nextUrl.pathname.startsWith("/dashboard/clients") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect to dashboard if authenticated user tries to access login/register
  if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}

