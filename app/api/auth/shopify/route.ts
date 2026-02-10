import { NextResponse } from 'next/server';
import { shopify } from '../../../../lib/shopify';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');

  if (!shop) {
    return NextResponse.json(
      { error: 'Missing shop parameter' },
      { status: 400 }
    );
  }

  // Validate shop domain format
  if (!shop.endsWith('.myshopify.com')) {
    return NextResponse.json(
      { error: 'Invalid shop domain' },
      { status: 400 }
    );
  }

  try {
    // Begin OAuth flow - web-api adapter returns a Response object
    const response = await shopify.auth.begin({
      shop,
      callbackPath: '/api/auth/callback',
      isOnline: false, // Use offline tokens for background access
      rawRequest: request,
    });

    // Extract redirect URL and cookies from Shopify's response,
    // then construct a NextResponse so cookies are properly forwarded
    const location = response.headers.get('location');
    if (!location) {
      return NextResponse.json(
        { error: 'No redirect URL returned from OAuth begin' },
        { status: 500 }
      );
    }

    const nextResponse = NextResponse.redirect(location);

    // Forward all Set-Cookie headers so the OAuth state cookie persists
    const setCookieHeaders = response.headers.getSetCookie();
    for (const cookie of setCookieHeaders) {
      nextResponse.headers.append('set-cookie', cookie);
    }

    return nextResponse;
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}
