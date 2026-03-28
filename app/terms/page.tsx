export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated: March 2026</p>

      <div className="space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using MedScan AI, you agree to be bound by these Terms of Service. If you do
            not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">2. Medical Disclaimer</h2>
          <p>
            MedScan AI is an <strong>informational tool only</strong>. It is not a licensed medical device,
            does not provide medical diagnoses, and is not a substitute for professional medical advice,
            diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any
            questions you may have regarding a medical condition.
          </p>
          <p className="mt-3">
            Never disregard professional medical advice or delay in seeking it because of something you
            have read on MedScan AI. If you think you may have a medical emergency, call your doctor or
            emergency services immediately.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">3. Use of AI Technology</h2>
          <p>
            MedScan AI uses Google&apos;s Gemini AI models to process your inputs. AI-generated results may
            be inaccurate, incomplete, or outdated. We do not guarantee the accuracy of any output. You
            use all AI-generated information at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">4. Your Data</h2>
          <p>
            Health data you enter (vitals, goals, medications, food logs, etc.) is stored locally on your
            device. If you are signed in, this data may be synced to your personal Firebase account to
            allow access across devices. We do not sell, share, or use your personal health data for any
            purpose other than providing the service to you.
          </p>
          <p className="mt-3">
            Images you upload for AI analysis are sent to Google&apos;s Gemini API for processing. They are
            not stored by MedScan AI after analysis is complete. Please review Google&apos;s privacy policy
            for information on how they handle API data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">5. Eligibility</h2>
          <p>
            You must be at least 13 years of age to use MedScan AI. By using the service, you represent
            that you meet this requirement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">6. Prohibited Uses</h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to reverse-engineer, disrupt, or abuse the service</li>
            <li>Rely on AI outputs for life-threatening medical decisions without consulting a doctor</li>
            <li>Upload images of others without their consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, MedScan AI and its creators shall not be liable for
            any direct, indirect, incidental, special, or consequential damages resulting from your use of
            or inability to use the service, including any damages arising from reliance on AI-generated
            medical information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">8. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of MedScan AI after changes
            constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">9. Contact</h2>
          <p>
            If you have any questions about these Terms, please reach out via the GitHub repository or the
            contact information provided in the app.
          </p>
        </section>

      </div>
    </div>
  );
}
