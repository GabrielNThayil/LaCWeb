import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, AlertTriangle, Clock, MapPin, Utensils } from 'lucide-react';
import { Logo } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'Terms of Service | La Couronne Cafe',
  description: 'Terms and conditions for using La Couronne Cafe website and ordering services.',
};

export default function TermsPage() {
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
            <FileText className="w-6 h-6 text-crown-gold" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-semibold text-crown-ink">
              Terms of Service
            </h1>
            <p className="text-sm text-crown-espresso/50">Last updated: June 2026</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none">
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">1. Acceptance of Terms</h2>
            <p className="text-crown-espresso/80">
              By accessing and using the La Couronne Cafe website (lacouronneindia.com), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Utensils className="w-5 h-5 text-crown-gold" />
              <h2 className="text-xl font-semibold text-crown-ink">2. Ordering & Fulfillment</h2>
            </div>
            <p className="text-crown-espresso/80 mb-4">
              By placing an order through our website, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-crown-espresso/80">
              <li>Provide accurate and complete order information</li>
              <li>Ensure someone is available to receive delivery at the specified address</li>
              <li>Accept delivery within the estimated timeframe</li>
              <li>Pay the full order amount including delivery fees</li>
              <li>Accept that order acceptance is subject to availability and confirmation</li>
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-crown-gold" />
              <h2 className="text-xl font-semibold text-crown-ink">3. Delivery Terms</h2>
            </div>
            <p className="text-crown-espresso/80 mb-4">
              Our delivery service is provided through Borzo:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-crown-espresso/80">
              <li>Estimated delivery time is 35-45 minutes (subject to traffic and distance)</li>
              <li>Delivery is available within serviceable areas of Bengaluru</li>
              <li>You must provide a valid delivery location with accurate coordinates</li>
              <li>La Couronne is not responsible for delays caused by traffic, weather, or third-party delivery partners</li>
              <li>Risk in goods transfers to customer upon delivery confirmation</li>
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-crown-gold" />
              <h2 className="text-xl font-semibold text-crown-ink">4. Private Space Booking</h2>
            </div>
            <p className="text-crown-espresso/80 mb-4">
              For private space rentals at our Cunningham Road location:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-crown-espresso/80">
              <li>Bookings are charged at INR 3000 per hour</li>
              <li>Maximum booking duration is 2 hours</li>
              <li>Payment is processed through Razorpay</li>
              <li>Cancellations must be made 24 hours in advance for full refund</li>
              <li>The space must be vacated on time for subsequent bookings</li>
              <li>Any damages will be charged to the booking customer</li>
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-crown-gold" />
              <h2 className="text-xl font-semibold text-crown-ink">5. Allergen & Dietary Information</h2>
            </div>
            <p className="text-crown-espresso/80 mb-4">
              While we take care to label allergens in our menu items:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-crown-espresso/80">
              <li>Our kitchen handles nuts, dairy, gluten, and soy products</li>
              <li>Cross-contamination is possible</li>
              <li>Customers with severe allergies should contact us directly before ordering</li>
              <li>La Couronne cannot guarantee allergen-free preparation</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">6. Pricing & Payment</h2>
            <p className="text-crown-espresso/80 mb-4">
              All prices shown on the website are in Indian Rupees (INR) and include applicable taxes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-crown-espresso/80">
              <li>Prices are subject to change without prior notice</li>
              <li>We accept payments via Razorpay (UPI, cards, net banking, wallets)</li>
              <li>Payment must be received before order processing begins</li>
              <li>Refunds are processed within 5-7 business days for eligible cancellations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">7. Intellectual Property</h2>
            <p className="text-crown-espresso/80">
              All content on this website, including text, images, logos, and design, is the property of La Couronne Cafe and protected by copyright laws. You may not reproduce, distribute, or create derivative works without our written permission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">8. Limitation of Liability</h2>
            <p className="text-crown-espresso/80">
              To the fullest extent permitted by law, La Couronne Cafe shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of this website or services. Our total liability shall not exceed the amount you paid for the specific order in question.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">9. Account Responsibility</h2>
            <p className="text-crown-espresso/80 mb-4">
              If you create an account on our website, you are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-crown-espresso/80">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">10. Governing Law</h2>
            <p className="text-crown-espresso/80">
              These Terms of Service are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">11. Contact Information</h2>
            <div className="bg-crown-cream/50 rounded-2xl p-6 border border-crown-espresso/10">
              <p className="font-medium text-crown-espresso">La Couronne Cafe</p>
              <p className="text-crown-espresso/80 text-sm mt-1">
                Ward No 78, Kareem Towers, 19/8, Cunningham Rd,<br />
                Vasanth Nagar, Bengaluru, Karnataka 560001
              </p>
              <p className="text-crown-espresso/80 text-sm mt-2">
                Phone: <a href="tel:+918431750295" className="text-crown-espresso hover:underline">084317 50295</a><br />
                Email: <a href="mailto:legal@lacouronneindia.com" className="text-crown-espresso hover:underline">legal@lacouronneindia.com</a>
              </p>
            </div>
          </section>

          <section className="border-t border-crown-espresso/10 pt-8">
            <p className="text-sm text-crown-espresso/50">
              We may update these Terms of Service from time to time. Continued use of our website after any changes constitutes acceptance of the updated terms.
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