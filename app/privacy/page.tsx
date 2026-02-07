export const metadata = {
  title: 'Privacy Policy - Product Admin Sidekick',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-sm sm:prose">
        <h1>Privacy Policy</h1>
        <p className="text-gray-500">Last updated: February 2025</p>

        <h2>1. Introduction</h2>
        <p>
          Product Admin Sidekick (&quot;the App&quot;) is a Shopify application that provides
          product analytics, notes, competitor tracking, trend analysis, and sales
          forecasting for Shopify merchants. This Privacy Policy explains how we collect,
          use, and protect your data when you use the App.
        </p>

        <h2>2. Data We Collect</h2>
        <p>When you install and use the App, we access and store the following data:</p>
        <ul>
          <li>
            <strong>Shop information:</strong> Your Shopify store domain and authentication
            credentials (access tokens) necessary to operate the App.
          </li>
          <li>
            <strong>Product data:</strong> Product titles, descriptions, prices, inventory
            levels, and status — synced from your Shopify store to provide analytics.
          </li>
          <li>
            <strong>Aggregated sales statistics:</strong> Order counts, revenue totals, and
            inventory changes used to generate reports and forecasts.
          </li>
          <li>
            <strong>User-generated content:</strong> Notes, competitor entries, and trend
            mappings that you create within the App.
          </li>
        </ul>

        <h2>3. Data We Do NOT Collect</h2>
        <ul>
          <li>We do not collect or store customer personal information (names, emails, addresses, payment details).</li>
          <li>We do not collect browsing behavior or tracking data from your store&apos;s visitors.</li>
          <li>We do not use cookies for tracking purposes.</li>
        </ul>

        <h2>4. How We Use Your Data</h2>
        <p>Your data is used exclusively to:</p>
        <ul>
          <li>Display product analytics and sales statistics within the App.</li>
          <li>Store your notes and competitor tracking information.</li>
          <li>Generate sales forecasts based on historical trends.</li>
          <li>Provide trend analysis and mapping features.</li>
        </ul>

        <h2>5. Data Storage and Security</h2>
        <p>
          Your data is stored securely in a PostgreSQL database hosted on Supabase with
          row-level security policies. All data is transmitted over encrypted HTTPS
          connections. Access tokens are stored securely and are never exposed to the
          client.
        </p>

        <h2>6. Data Sharing</h2>
        <p>
          We do not sell, rent, or share your data with third parties. Your data is only
          accessed by the App to provide its features to you.
        </p>

        <h2>7. Data Retention and Deletion</h2>
        <p>
          Your data is retained for as long as the App is installed on your Shopify store.
          When you uninstall the App, we receive a webhook notification from Shopify and
          delete all associated shop data, including notes, competitor entries, product
          stats, and access tokens, within 30 days.
        </p>
        <p>
          You may request immediate deletion of your data at any time by contacting us
          (see Section 10).
        </p>

        <h2>8. GDPR Compliance</h2>
        <p>We comply with the General Data Protection Regulation (GDPR) by:</p>
        <ul>
          <li>Processing data only as necessary to provide the App&apos;s functionality.</li>
          <li>Responding to customer data requests forwarded by Shopify.</li>
          <li>Honoring data deletion (redaction) requests from Shopify.</li>
          <li>Deleting all merchant data upon app uninstallation.</li>
        </ul>
        <p>
          As a data processor, we handle mandatory GDPR webhooks from Shopify including
          customer data requests, customer data erasure, and shop data erasure.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Continued use of the App
          after changes constitutes acceptance of the updated policy.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or wish to request data deletion,
          please contact us at:
        </p>
        <p>
          <strong>Email:</strong> support@productadminsidekick.com
        </p>
      </div>
    </div>
  );
}
