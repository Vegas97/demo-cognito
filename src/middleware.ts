/**
 * Middleware for handling authentication and route protection in Next.js
 * This file manages route access based on authentication status and route types
 */

import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

// Initialize NextAuth middleware with our auth configuration
const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  // Extract URL and authentication status from the request
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Determine the type of route being accessed
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Skip middleware for API authentication routes (e.g., /api/auth/*)
  if (isApiAuthRoute) {
    return;
  }

  // Handle auth routes (login, register, etc.)
  if (isAuthRoute) {
    // Redirect already authenticated users away from auth pages
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  // Protect non-public routes from unauthenticated access
  if (!isLoggedIn && !isPublicRoute) {
    // Save the attempted URL as a callback URL after login
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    // Redirect to login page with callback URL
    return Response.redirect(new URL(
      `/auth/login?callbackUrl=${encodedCallbackUrl}`,
      nextUrl
    ));
  }

  // Allow the request to proceed for:
  // - Authenticated users accessing protected routes
  // - Public routes
  return;
});

// Configure which paths should be processed by this middleware
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}