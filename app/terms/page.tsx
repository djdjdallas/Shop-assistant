export const metadata = {
  title: 'Terms of Service - Product Admin Sidekick',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto prose prose-sm sm:prose">
        <h1>Terms of Service</h1>
        <p className="text-gray-500">Last updated: February 2025</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By installing and using Product Admin Sidekick (&quot;the App&quot;), you agree to
          these Terms of Service. If you do not agree, please uninstall the App.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Product Admin Sidekick is a Shopify application that provides product analytics,
          notes, competitor tracking, trend analysis, and sales forecasting tools for
          Shopify merchants. The App is embedded within your Shopify admin panel.
        </p>

        <h2>3. Account and Access</h2>
        <p>
          The App is accessed through your Shopify admin account. You are responsible for
          maintaining the security of your Shopify account. The App requires certain
          access scopes (product read/write, order read, inventory read) to function
          properly.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the App for any unlawful purpose.</li>
          <li>Attempt to gain unauthorized access to the App&apos;s systems or data.</li>
          <li>Interfere with or disrupt the App&apos;s infrastructure.</li>
          <li>Reverse engineer, decompile, or disassemble the App.</li>
          <li>Use the App to collect or store data beyond its intended functionality.</li>
        </ul>

        <h2>5. Data and Privacy</h2>
        <p>
          Your use of the App is also governed by our{' '}
          <a href="/privacy">Privacy Policy</a>, which describes how we collect, use, and
          protect your data.
        </p>

        <h2>6. Accuracy of Information</h2>
        <p>
          While we strive to provide accurate analytics, forecasts, and trend data, the
          App&apos;s outputs are for informational purposes only. Sales forecasts and trend
          analyses are estimates and should not be the sole basis for business decisions.
          We do not guarantee the accuracy, completeness, or reliability of any analytics
          or predictions.
        </p>

        <h2>7. Service Availability</h2>
        <p>
          We aim to provide reliable service but do not guarantee uninterrupted access.
          The App may be temporarily unavailable due to maintenance, updates, or
          circumstances beyond our control. We are not liable for any losses resulting from
          service interruptions.
        </p>

        <h2>8. Intellectual Property</h2>
        <p>
          The App, including its code, design, and documentation, is the intellectual
          property of the developer. You are granted a limited, non-exclusive,
          non-transferable license to use the App as installed on your Shopify store.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, the App is provided &quot;as is&quot;
          without warranties of any kind. We shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, including loss of
          profits, data, or business opportunities, arising from your use of the App.
        </p>

        <h2>10. Termination</h2>
        <p>
          You may stop using the App at any time by uninstalling it from your Shopify
          store. We reserve the right to suspend or terminate access to the App if these
          terms are violated. Upon uninstallation, your data will be deleted in accordance
          with our Privacy Policy.
        </p>

        <h2>11. Changes to Terms</h2>
        <p>
          We may update these Terms of Service from time to time. Continued use of the App
          after changes constitutes acceptance of the updated terms.
        </p>

        <h2>12. Governing Law</h2>
        <p>
          These terms shall be governed by and construed in accordance with applicable law,
          without regard to conflict of law provisions.
        </p>

        <h2>13. Contact</h2>
        <p>
          For questions about these Terms of Service, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> support@productsidekick.store
        </p>
      </div>
    </div>
  );
}
