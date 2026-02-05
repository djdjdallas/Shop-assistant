import { NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  getShopFromWebhook,
  webhookResponse,
} from '../../../../../lib/webhooks/verify';
import { getSupabaseServerClient } from '../../../../../lib/supabase-server';

interface CustomerDataRequestPayload {
  shop_id: number;
  shop_domain: string;
  orders_requested: string[];
  customer: {
    id: number;
    email: string;
    phone: string;
  };
  data_request: {
    id: number;
  };
}

/**
 * GDPR Customer Data Request Webhook
 *
 * This webhook is called when a customer requests their data.
 * We must respond with any data we have stored about the customer.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const hmac = request.headers.get('x-shopify-hmac-sha256');

  // Verify the webhook is from Shopify
  const isValid = await verifyWebhookSignature(rawBody, hmac);
  if (!isValid) {
    console.error('Invalid webhook signature for customer data request');
    return webhookResponse(false);
  }

  const shopDomain = getShopFromWebhook(request);
  if (!shopDomain) {
    console.error('Missing shop domain in webhook');
    return webhookResponse(false);
  }

  try {
    const payload: CustomerDataRequestPayload = JSON.parse(rawBody);
    const customerEmail = payload.customer?.email;

    if (!customerEmail) {
      // No customer email provided, nothing to look up
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

    // Note: Our current schema doesn't store customer-specific data.
    // If we add customer data in the future, we would query it here.
    //
    // Example of what we might return if we had customer data:
    // const { data: customerData } = await supabase
    //   .from('customer_data')
    //   .select('*')
    //   .eq('shop_id', shop.id)
    //   .eq('email', customerEmail);

    // For now, we acknowledge the request but have no customer data to provide.
    // In production, you might want to send this data to a fulfillment endpoint
    // or email it to a designated address.

    console.log(`Customer data request processed for shop: ${shopDomain}`);

    return webhookResponse(true);
  } catch (error) {
    console.error('Error processing customer data request:', error);
    // Still return 200 to acknowledge receipt
    return webhookResponse(true);
  }
}
