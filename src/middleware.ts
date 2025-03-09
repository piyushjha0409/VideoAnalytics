import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isAuthenticated = !!req.nextauth.token; // Checks if a user is authenticated

    const protectedRoutes = ["/upload", "/dashboard"];
    const publicRoutes = ["/", "/login", "/register"];

    // Redirect unauthenticated users trying to access protected routes
    if (!isAuthenticated && protectedRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Allow authenticated users to access public routes without redirecting
    if (isAuthenticated && publicRoutes.includes(pathname)) {
      return NextResponse.next(); // Do not redirect
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Only allow authenticated users
    },
  }
);

export const config = {
  matcher: ["/upload", "/dashboard", "/", "/login", "/register"],
};