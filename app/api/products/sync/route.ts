import { NextResponse } from 'next/server';

export async function POST() {
  // TODO: Trigger Shopify product sync job for the authenticated shop.
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
