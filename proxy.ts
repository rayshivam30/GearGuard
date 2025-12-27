import { type NextRequest, NextResponse } from "next/server"

const protectedRoutes = ["/dashboard", "/equipment", "/teams", "/requests", "/work-centers", "/users", "/calendar"]

export function proxy(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value

  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if ((request.nextUrl.pathname === "/sign-in" || request.nextUrl.pathname === "/sign-up") && userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
