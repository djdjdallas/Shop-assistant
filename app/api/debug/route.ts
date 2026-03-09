import { NextResponse } from 'next/server';

/**
 * Diagnostic endpoint to verify Shopify app configuration.
 * GET /api/debug?shop=xxx.myshopify.com
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');

  const apiKey = process.env.SHOPIFY_API_KEY;
  const publicApiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;
  const appUrl = process.env.SHOPIFY_APP_URL;
  const apiSecret = process.env.SHOPIFY_API_SECRET;

  const checks: Record<string, { ok: boolean; detail: string }> = {};

  // 1. Check env vars exist
  checks['SHOPIFY_API_KEY'] = {
    ok: !!apiKey,
    detail: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'MISSING',
  };
  checks['NEXT_PUBLIC_SHOPIFY_API_KEY'] = {
    ok: !!publicApiKey,
    detail: publicApiKey ? `${publicApiKey.substring(0, 8)}...${publicApiKey.substring(publicApiKey.length - 4)}` : 'MISSING',
  };
  checks['SHOPIFY_API_SECRET'] = {
    ok: !!apiSecret,
    detail: apiSecret ? 'set' : 'MISSING',
  };
  checks['SHOPIFY_APP_URL'] = {
    ok: !!appUrl,
    detail: appUrl || 'MISSING',
  };

  // 2. Check API keys match
  checks['API_KEYS_MATCH'] = {
    ok: apiKey === publicApiKey,
    detail: apiKey === publicApiKey ? 'yes' : `MISMATCH: server=${apiKey?.substring(0, 8)} vs public=${publicApiKey?.substring(0, 8)}`,
  };

  // 3. Check if shop has a stored session
  if (shop) {
    try {
      const { sessionStorage } = await import('../../../lib/shopify');
      const session = await sessionStorage.loadSession(`offline_${shop}`);
      checks['SHOP_SESSION'] = {
        ok: !!session?.accessToken,
        detail: session?.accessToken
          ? `installed (scope: ${session.scope || 'unknown'})`
          : 'NO SESSION — app may not be installed on this shop. Visit /api/auth/shopify?shop=' + shop,
      };
    } catch (err) {
      checks['SHOP_SESSION'] = {
        ok: false,
        detail: `Error checking session: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  } else {
    checks['SHOP_SESSION'] = {
      ok: false,
      detail: 'No shop param provided — add ?shop=yourstore.myshopify.com',
    };
  }

  // 4. Check app URL format
  if (appUrl) {
    checks['APP_URL_FORMAT'] = {
      ok: appUrl.startsWith('https://') && !appUrl.endsWith('/'),
      detail: !appUrl.startsWith('https://')
        ? 'Should start with https://'
        : appUrl.endsWith('/')
        ? 'Should not end with /'
        : 'ok',
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json({
    status: allOk ? 'all_checks_passed' : 'issues_found',
    checks,
    hint: allOk
      ? 'Configuration looks good. If idToken() still hangs, try reinstalling the app on the shop.'
      : 'Fix the issues above. The most common cause of idToken() hanging is an API key mismatch or the app not being installed.',
  });
}
