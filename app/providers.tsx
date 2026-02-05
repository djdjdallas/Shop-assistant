'use client';

import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * App Providers wrapper.
 *
 * Note: App Bridge 4.x works differently from previous versions.
 * The app-bridge script is loaded automatically when the app is embedded
 * in Shopify admin. Use the useAppBridge hook in components that need
 * App Bridge functionality.
 *
 * For future enhancements, add additional providers here (e.g., theme, state management).
 */
export default function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}
