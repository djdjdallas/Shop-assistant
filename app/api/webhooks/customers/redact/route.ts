import { NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  getShopFromWebhook,
  webhookResponse,
} from '../../../../../lib/webhooks/verify';
import { getSupabaseServerClient } from '../../../../../lib/supabase-server';

interface CustomerRedactPayload {
  shop_id: number;
  shop_domain: string;
  customer: {
    id: number;
    email: string;
    phone: string;
  };
  orders_to_redact: string[];
}

/**
 * GDPR Customer Redact Webhook
 *
 * This webhook is called when a shop owner requests deletion of a customer's data,
 * or when a customer requests their data be deleted via the shop.
 * We must delete any PII we have stored about this customer.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const hmac = request.headers.get('x-shopify-hmac-sha256');

  // Verify the webhook is from Shopify
  const isValid = await verifyWebhookSignature(rawBody, hmac);
  if (!isValid) {
    console.error('Invalid webhook signature for customer redact');
    return webhookResponse(false);
  }

  const shopDomain = getShopFromWebhook(request);
  if (!shopDomain) {
    console.error('Missing shop domain in webhook');
    return webhookResponse(false);
  }

  try {
    const payload: CustomerRedactPayload = JSON.parse(rawBody);
    const customerId = payload.customer?.id;
    const customerEmail = payload.customer?.email;

    if (!customerId && !customerEmail) {
      // No customer identifier provided
      return webhookResponse(true);
    }

    const supabase = getSupabaseServerClient();

    // Get shop ID
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('shop_domain', shopDomain)
      .single();

    if (!shop) {
      // Shop not found in our system
      return webhookResponse(true);
    }

    // Note: Our current schema doesn't store customer PII directly.
    // Product notes may contain customer-related information, but they are
    // associated with products, not customers.
    //
    // If we add customer data tables in the future:
    // await supabase
    //   .from('customer_data')
    //   .delete()
    //   .eq('shop_id', shop.id)
    //   .eq('customer_id', customerId);

    // Log the redaction request for audit purposes
    console.log(
      `Customer redact processed for shop: ${shopDomain}, ` +
      `customer_id: ${customerId}, email: ${customerEmail ? '***' : 'not provided'}`
    );

    return webhookResponse(true);
  } catch (error) {
    console.error('Error processing customer redact:', error);
    // Still return 200 to acknowledge receipt
    return webhookResponse(true);
  }
}
