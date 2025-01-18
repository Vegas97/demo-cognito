/**
 * Middleware for handling authentication and route protection in Next.js
 * This file manages route access based on authentication status and route types
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const session = await auth();

  // Extract URL and authentication status from the request
  const { nextUrl } = request;
  const isLoggedIn = !!session;

  // Determine the type of route being accessed
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Skip middleware for API authentication routes (e.g., /api/auth/*)
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Handle auth routes (login, register, etc.)
  if (isAuthRoute) {
    // Redirect already authenticated users away from auth pages
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
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
    return NextResponse.redirect(new URL(
      `/auth/login?callbackUrl=${encodedCallbackUrl}`,
      nextUrl
    ));
  }

  // Allow the request to proceed for:
  // - Authenticated users accessing protected routes
  // - Public routes
  return NextResponse.next();
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}