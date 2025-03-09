import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const middleware = async (request: NextRequest) => {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Redirect authenticated users away from sign-in, register, and home pages
  if (token) {
    if (
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/register") ||
      url.pathname === "/"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    // Redirect unauthenticated users to the sign-in page if they try to access protected routes
    if (url.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  // Allow the request to proceed if no redirection is needed
  return NextResponse.next();
};

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard",
    "/dashboard/:path*", // Apply middleware to all subroutes of /dashboard
  ],
};
