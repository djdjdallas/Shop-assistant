import { NextResponse } from 'next/server';
import { shopify, sessionStorage } from '../../../../lib/shopify';

// Import the enum for token type
const OFFLINE_TOKEN_TYPE = 'urn:shopify:params:oauth:token-type:offline-access-token' as const;

/**
 * Token exchange endpoint for App Bridge 4.x embedded apps.
 *
 * Instead of the redirect-based OAuth flow (which fails due to cookie/state issues
 * in embedded iframes), this uses the id_token that Shopify passes as a URL
 * parameter to exchange for an offline access token.
 *
 * POST /api/auth/token-exchange
 * Body: { sessionToken: "..." }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionToken = body.sessionToken;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Missing sessionToken in request body' },
        { status: 400 }
      );
    }

    // Decode the JWT payload without verification to get the shop domain.
    // We do this first to check for an existing session before full verification.
    const parts = sessionToken.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    const shop = (payload.dest || '').replace('https://', '');

    if (!shop) {
      return NextResponse.json({ error: 'No shop in token' }, { status: 400 });
    }

    console.log('[Token Exchange] Starting for shop:', shop);

    // Check if we already have a valid session for this shop
    const existingSession = await sessionStorage.loadSession(`offline_${shop}`);
    if (existingSession?.accessToken) {
      console.log('[Token Exchange] Existing session found for:', shop);
      return NextResponse.json({
        success: true,
        shop,
        message: 'Session already exists',
      });
    }

    // Exchange the session token for an offline access token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { session } = await shopify.auth.tokenExchange({
      sessionToken,
      shop,
      requestedTokenType: OFFLINE_TOKEN_TYPE as any,
    });

    console.log('[Token Exchange] Got access token for:', shop, 'scope:', session.scope);

    // Store the session in Supabase
    const stored = await sessionStorage.storeSession(session);
    if (!stored) {
      console.error('[Token Exchange] Failed to store session');
      return NextResponse.json(
        { error: 'Failed to store session' },
        { status: 500 }
      );
    }

    console.log('[Token Exchange] Session stored successfully for:', shop);

    return NextResponse.json({
      success: true,
      shop,
      message: 'Token exchange successful',
    });
  } catch (error) {
    console.error('[Token Exchange] Error:', error);
    return NextResponse.json(
      {
        error: 'Token exchange failed',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
