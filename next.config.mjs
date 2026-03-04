/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Security headers — CSP is handled exclusively by middleware.ts
  // to avoid duplicate/conflicting Content-Security-Policy headers.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // External packages that should be transpiled
  transpilePackages: ['@shopify/app-bridge-react'],
};

export default nextConfig;
