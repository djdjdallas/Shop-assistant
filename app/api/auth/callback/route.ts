import { NextResponse } from 'next/server';
import { Session } from '@shopify/shopify-api';
import { shopify, sessionStorage } from '../../../../lib/shopify';

export async function GET(request: Request) {
  const url = new URL(request.url);

  try {
    // Complete OAuth flow and get session with access token
    const callback = await shopify.auth.callback({
      rawRequest: request,
    });

    const { session } = callback;

    // Store the session in Supabase
    const stored = await sessionStorage.storeSession(session);

    if (!stored) {
      console.error('Failed to store session');
      return NextResponse.json(
        { error: 'Failed to store session' },
        { status: 500 }
      );
    }

    // Register webhooks after successful installation
    try {
      await registerWebhooks(session.shop, session.accessToken!);
    } catch (webhookError) {
      console.error('Failed to register webhooks:', webhookError);
      // Don't fail the installation if webhook registration fails
    }

    // Construct the embedded app URL
    const host = url.searchParams.get('host');
    const appUrl = process.env.SHOPIFY_APP_URL || 'http://localhost:3000';

    // Redirect to the embedded app
    const redirectUrl = host
      ? `https://${session.shop}/admin/apps/${process.env.SHOPIFY_API_KEY}?host=${host}`
      : `${appUrl}/dashboard`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'OAuth callback failed' },
      { status: 500 }
    );
  }
}

async function registerWebhooks(shop: string, accessToken: string) {
  const webhooks = [
    {
      topic: 'CUSTOMERS_DATA_REQUEST',
      address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/customers/data-request`,
    },
    {
      topic: 'CUSTOMERS_REDACT',
      address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/customers/redact`,
    },
    {
      topic: 'SHOP_REDACT',
      address: `${process.env.SHOPIFY_APP_URL}/api/webhooks/shop/redact`,
    },
  ];

  const session = new Session({
    id: `offline_${shop}`,
    shop,
    state: '',
    isOnline: false,
    accessToken,
  });

  const client = new shopify.clients.Graphql({ session });

  for (const webhook of webhooks) {
    try {
      await client.request(`
        mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
          webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
            webhookSubscription {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        variables: {
          topic: webhook.topic,
          webhookSubscription: {
            callbackUrl: webhook.address,
            format: 'JSON',
          },
        },
      });
    } catch (err) {
      console.error(`Failed to register ${webhook.topic} webhook:`, err);
    }
  }
}
