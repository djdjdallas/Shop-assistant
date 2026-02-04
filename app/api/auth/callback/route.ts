import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Handle Shopify OAuth callback and store shop credentials.
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
