import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify Shopify webhook HMAC-SHA256 signature.
 * This ensures the webhook is genuinely from Shopify.
 */
export async function verifyWebhookSignature(
  body: string,
  hmacHeader: string | null
): Promise<boolean> {
  if (!hmacHeader) {
    console.error('Missing HMAC header');
    return false;
  }

  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) {
    console.error('Missing SHOPIFY_API_SECRET');
    return false;
  }

  try {
    const hash = createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64');

    // Use timing-safe comparison to prevent timing attacks
    const hashBuffer = Buffer.from(hash, 'base64');
    const hmacBuffer = Buffer.from(hmacHeader, 'base64');

    if (hashBuffer.length !== hmacBuffer.length) {
      return false;
    }

    return timingSafeEqual(hashBuffer, hmacBuffer);
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

/**
 * Extract shop domain from webhook headers.
 */
export function getShopFromWebhook(request: Request): string | null {
  return request.headers.get('x-shopify-shop-domain');
}

/**
 * Get the webhook topic from headers.
 */
export function getWebhookTopic(request: Request): string | null {
  return request.headers.get('x-shopify-topic');
}

/**
 * Standard response for webhook acknowledgment.
 */
export function webhookResponse(success: boolean = true) {
  return new Response(null, {
    status: success ? 200 : 400,
  });
}
