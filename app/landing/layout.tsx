import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Admin Sidekick | DevTools for Shopify',
  description:
    'A productivity layer for Shopify. Manage notes, track competitor pricing, and forecast sales without leaving the product page.',
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
