import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '@/config/app';

export default function Privacy() {
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
          <h1 className="text-lg font-semibold">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <p className="text-muted-foreground text-sm">
          Last updated: January 1, 2025
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Introduction</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {APP_CONFIG.name} ("we," "our," or "us") is committed to protecting your privacy and your child's privacy. 
            This Privacy Policy explains how we collect, use, and safeguard information when you use our mobile application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Information We Collect</h2>
          <div className="space-y-2 text-muted-foreground text-sm leading-relaxed">
            <p><strong className="text-foreground">Account Information:</strong> Email address for authentication purposes.</p>
            <p><strong className="text-foreground">Baby Profile:</strong> Baby's name and birth date to personalize age-appropriate food recommendations.</p>
            <p><strong className="text-foreground">Food Logs:</strong> Records of foods introduced, reactions noted, and feeding history.</p>
            <p><strong className="text-foreground">Photos:</strong> Optional meal photos you choose to upload.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">How We Use Your Information</h2>
          <ul className="text-muted-foreground text-sm leading-relaxed space-y-1 list-disc list-inside">
            <li>Provide personalized food introduction tracking</li>
            <li>Send optional feeding reminders and milestone notifications</li>
            <li>Generate progress reports for healthcare providers</li>
            <li>Improve our app features and user experience</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Children's Privacy (COPPA Compliance)</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {APP_CONFIG.name} is designed for parents and caregivers to track their infant's feeding journey. 
            We do not knowingly collect personal information directly from children under 13. 
            All data is provided by and managed by the parent or guardian account holder. 
            Parents can review, modify, or delete their child's information at any time through the app settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Data Storage & Security</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your data is securely stored using industry-standard encryption. We use secure cloud infrastructure 
            with row-level security to ensure your data is accessible only to you. We do not sell, rent, or 
            share your personal information with third parties for marketing purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Your Rights</h2>
          <ul className="text-muted-foreground text-sm leading-relaxed space-y-1 list-disc list-inside">
            <li>Access your personal data at any time</li>
            <li>Update or correct your information</li>
            <li>Delete your account and all associated data</li>
            <li>Export your feeding history</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Third-Party Services</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We use secure cloud services for data storage and authentication. 
            These services are compliant with industry security standards and do not have access 
            to your data beyond what is necessary to provide the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Changes to This Policy</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Contact Us</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            If you have questions about this Privacy Policy, please contact us at:{' '}
            <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-primary underline">
              {APP_CONFIG.supportEmail}
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
