import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for security and session verification.
 *
 * This runs on the Edge runtime for all matched routes.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.myshopify.com https://*.shopify.com wss://*.shopify.com https://*.supabase.co",
    "frame-ancestors 'self' https://*.myshopify.com https://admin.shopify.com",
    "frame-src 'self' https://*.myshopify.com https://admin.shopify.com",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspDirectives);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // For API routes, verify session token if present
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip auth check for auth routes and webhooks
    if (
      request.nextUrl.pathname.startsWith('/api/auth/') ||
      request.nextUrl.pathname.startsWith('/api/webhooks/')
    ) {
      return response;
    }

    // In production, we could verify the session token here
    // For now, the API routes handle their own authentication
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
