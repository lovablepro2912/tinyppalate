import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '@/config/app';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Terms of Service</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <p className="text-muted-foreground text-sm">
          Last updated: January 1, 2025
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Acceptance of Terms</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            By accessing or using {APP_CONFIG.name}, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the app.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Description of Service</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {APP_CONFIG.name} is a food introduction tracking application designed to help parents 
            and caregivers monitor their baby's feeding journey, track allergen exposures, and 
            maintain feeding records.
          </p>
        </section>

        <section className="space-y-3 bg-warning/10 border border-warning/20 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-warning">⚠️ Medical Disclaimer</h2>
          <div className="text-muted-foreground text-sm leading-relaxed space-y-2">
            <p>
              <strong className="text-foreground">{APP_CONFIG.name} is NOT a substitute for professional medical advice.</strong>
            </p>
            <p>
              The information provided in this app is for general informational purposes only and should not 
              be considered medical advice. Always consult with your pediatrician or qualified healthcare 
              provider before introducing new foods to your baby, especially if your child has known allergies 
              or medical conditions.
            </p>
            <p>
              In case of a suspected allergic reaction, contact your healthcare provider immediately or 
              call emergency services. Do not rely solely on this app for emergency medical decisions.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">User Responsibilities</h2>
          <ul className="text-muted-foreground text-sm leading-relaxed space-y-1 list-disc list-inside">
            <li>Provide accurate information about your child</li>
            <li>Keep your account credentials secure</li>
            <li>Use the app for its intended purpose</li>
            <li>Not share your account with others</li>
            <li>Report any security concerns promptly</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">User Content</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You retain ownership of any content you submit to the app, including photos and notes. 
            By uploading content, you grant us a limited license to store and display it within 
            your account for the purpose of providing our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Account Termination</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You may delete your account at any time through the app settings. Upon deletion, 
            all your data will be permanently removed from our systems. We reserve the right 
            to suspend or terminate accounts that violate these terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Limitation of Liability</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            To the maximum extent permitted by law, {APP_CONFIG.name} and its creators shall not 
            be liable for any indirect, incidental, special, consequential, or punitive damages 
            resulting from your use of the app. This includes but is not limited to health 
            decisions made based on information provided in the app.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Intellectual Property</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The app, including its design, features, and content (excluding user content), 
            is owned by us and protected by copyright and other intellectual property laws. 
            You may not copy, modify, or distribute any part of the app without our permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Changes to Terms</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We may update these Terms of Service from time to time. Continued use of the app 
            after changes constitutes acceptance of the new terms. We will notify users of 
            significant changes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            For questions about these Terms, contact us at:{' '}
            <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-primary underline">
              {APP_CONFIG.supportEmail}
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
