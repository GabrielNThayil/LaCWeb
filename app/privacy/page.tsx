import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Eye, FileText, Globe } from 'lucide-react';
import { Logo } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'Privacy Policy | La Couronne Cafe',
  description: 'How La Couronne Cafe collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-crown-paper">
      {/* Header */}
      <header className="border-b border-crown-espresso/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={28} />
          </Link>
          <Link href="/" className="text-sm text-crown-espresso/60 hover:text-crown-espresso">
            ← Back to site
          </Link>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-crown-espresso/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-crown-gold" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-semibold text-crown-ink">
              Privacy Policy
            </h1>
            <p className="text-sm text-crown-espresso/50">Last updated: June 2026</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none">
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">1. Information We Collect</h2>
            <p className="text-crown-espresso/80 mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-crown-espresso/80">
              <li><strong>Account Information:</strong> Name, email address, phone number when you create an account</li>
              <li><strong>Order Information:</strong> Delivery address, order preferences, and payment details</li>
              <li><strong>Location Data:</strong> When you share your location for delivery, we collect coordinates</li>
              <li><strong>Communication Data:</strong> Messages you send us via contact forms or email</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">2. How We Use Your Information</h2>
            <p className="text-crown-espresso/80 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-crown-espresso/80">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and updates via SMS and email</li>
              <li>Arrange delivery through our partner Borzo</li>
              <li>Process payments securely through Razorpay</li>
              <li>Provide personalized recommendations based on your preferences</li>
              <li>Improve our services and website experience</li>
              <li>Respond to your inquiries and support requests</li>
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-crown-gold" />
              <h2 className="text-xl font-solid font-semibold text-crown-ink">3. Payment Security</h2>
            </div>
            <p className="text-crown-espresso/80 mb-4">
              All payment processing is handled by Razorpay, a PCI DSS compliant payment gateway. We never store your complete card details on our servers. Your payment information is encrypted and transmitted securely.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-crown-gold" />
              <h2 className="text-xl font-semibold text-crown-ink">4. Third-Party Services</h2>
            </div>
            <p className="text-crown-espresso/80 mb-4">
              We use trusted third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-crown-espresso/80">
              <li><strong>Razorpay:</strong> Payment processing (razorpay.com)</li>
              <li><strong>Borzo:</strong> Delivery partner for order fulfillment (borzo.in)</li>
              <li><strong>NextAuth:</strong> Secure authentication</li>
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-crown-gold" />
              <h2 className="text-xl font-semibold text-crown-ink">5. Cookies & Tracking</h2>
            </div>
            <p className="text-crown-espresso/80 mb-4">
              We use essential cookies to maintain your session and cart functionality. We do not use tracking cookies for advertising purposes. You can manage your cookie preferences through our cookie consent banner when you first visit our site.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-crown-gold" />
              <h2 className="text-xl font-semibold text-crown-ink">6. Your Rights</h2>
            </div>
            <p className="text-crown-espresso/80 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-crown-espresso/80">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">7. Data Retention</h2>
            <p className="text-crown-espresso/80">
              We retain your account information for as long as your account is active. Order history is retained for 3 years for legal and tax compliance purposes. You may request deletion of your data at any time.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">8. Contact Us</h2>
            <p className="text-crown-espresso/80 mb-4">
              For privacy-related questions or to exercise your rights, contact us:
            </p>
            <div className="bg-crown-cream/50 rounded-2xl p-6 border border-crown-espresso/10">
              <p className="font-medium text-crown-espresso">La Couronne Cafe</p>
              <p className="text-crown-espresso/80 text-sm mt-1">
                Ward No 78, Kareem Towers, 19/8, Cunningham Rd,<br />
                Vasanth Nagar, Bengaluru, Karnataka 560001
              </p>
              <p className="text-crown-espresso/80 text-sm mt-2">
                Phone: <a href="tel:+918431750295" className="text-crown-espresso hover:underline">084317 50295</a><br />
                Email: <a href="mailto:privacy@lacouronneindia.com" className="text-crown-espresso hover:underline">privacy@lacouronneindia.com</a>
              </p>
            </div>
          </section>

          <section className="border-t border-crown-espresso/10 pt-8">
            <p className="text-sm text-crown-espresso/50">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>
        </div>
      </article>

      {/* Footer Links */}
      <footer className="border-t border-crown-espresso/10 bg-white/50 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap gap-6 text-sm text-crown-espresso/60 justify-center">
          <Link href="/privacy" className="hover:text-crown-espresso">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-crown-espresso">Terms of Service</Link>
          <Link href="/contact" className="hover:text-crown-espresso">Contact Us</Link>
        </div>
      </footer>
    </main>
  );
}