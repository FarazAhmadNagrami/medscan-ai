export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated: March 2026</p>

      <div className="space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">1. Overview</h2>
          <p>
            MedScan AI is committed to protecting your privacy. This policy explains what data we collect,
            how we use it, and the choices you have. We do not sell your data to anyone.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">2. Data We Collect</h2>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Account Information</h3>
              <p>When you sign in with Google, we receive your name, email address, and profile photo from Google. This is used solely for authentication.</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Health Data You Enter</h3>
              <p>Vitals, medications, goals, food logs, water intake, and similar data you input is stored locally on your device. If you are signed in, it is synced to your private Firebase account so you can access it across devices. No one else can access your data.</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Images You Upload</h3>
              <p>Photos you upload for AI analysis (pills, prescriptions, food, skin, X-rays, etc.) are sent to Google&apos;s Gemini API for processing. MedScan AI does not store these images after analysis. Please review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Google&apos;s Privacy Policy</a> for details on API data handling.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">3. How We Use Your Data</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide and personalise the MedScan AI service to you</li>
            <li>To sync your health data across your devices when signed in</li>
            <li>To process AI analysis requests via Gemini</li>
            <li>We do <strong>not</strong> use your data for advertising, profiling, or sale to third parties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">4. Data Storage & Security</h2>
          <p>
            Your health data is stored in Google Firebase Firestore under your unique user ID.
            Access is restricted by security rules — only you can read or write your own data.
            Data is encrypted in transit (HTTPS) and at rest by Firebase.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">5. Third-Party Services</h2>
          <p>MedScan AI uses the following third-party services:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Google Gemini API</strong> — AI analysis of text and images</li>
            <li><strong>Google Firebase</strong> — Authentication and cloud data storage</li>
            <li><strong>RxNorm (U.S. National Library of Medicine)</strong> — Drug database lookups</li>
          </ul>
          <p className="mt-3">Each of these services has its own privacy policy. We encourage you to review them.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Access</strong> — view the data stored in your account</li>
            <li><strong>Delete</strong> — sign out and clear your local data at any time; contact us to remove your Firebase data</li>
            <li><strong>Portability</strong> — your health data is stored in standard JSON format</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">7. Children&apos;s Privacy</h2>
          <p>
            MedScan AI is not directed at children under 13. We do not knowingly collect personal
            information from children under 13. If you believe a child has provided us with personal
            information, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of significant
            changes by updating the date at the top of this page. Continued use of MedScan AI after
            changes constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">9. Contact</h2>
          <p>
            If you have questions or requests regarding your privacy, please contact us via the
            GitHub repository linked in the app.
          </p>
        </section>

      </div>
    </div>
  );
}
