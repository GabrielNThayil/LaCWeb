import { Metadata } from 'next';
import Link from 'next/link';
import { Accessibility, Eye, Keyboard, Volume2, Smartphone } from 'lucide-react';
import { Logo } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'Accessibility Statement | La Couronne Cafe',
  description: 'La Couronne Cafe is committed to ensuring digital accessibility for all users.',
};

export default function AccessibilityPage() {
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
            <Accessibility className="w-6 h-6 text-crown-gold" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-semibold text-crown-ink">
              Accessibility Statement
            </h1>
            <p className="text-sm text-crown-espresso/50">Last updated: June 2026</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none">
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">Our Commitment</h2>
            <p className="text-crown-espresso/80">
              La Couronne Cafe is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">Accessibility Features</h2>
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/80 border border-crown-espresso/10">
                <div className="w-10 h-10 rounded-full bg-crown-espresso/10 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5 text-crown-gold" />
                </div>
                <div>
                  <h3 className="font-medium text-crown-espresso">Visual Design</h3>
                  <p className="text-sm text-crown-espresso/60 mt-1">
                    High contrast colors, readable fonts, and clear visual hierarchy for better visibility.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/80 border border-crown-espresso/10">
                <div className="w-10 h-10 rounded-full bg-crown-espresso/10 flex items-center justify-center shrink-0">
                  <Keyboard className="w-5 h-5 text-crown-gold" />
                </div>
                <div>
                  <h3 className="font-medium text-crown-espresso">Keyboard Navigation</h3>
                  <p className="text-sm text-crown-espresso/60 mt-1">
                    All interactive elements are accessible via keyboard for users who cannot use a mouse.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/80 border border-crown-espresso/10">
                <div className="w-10 h-10 rounded-full bg-crown-espresso/10 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-crown-gold" />
                </div>
                <div>
                  <h3 className="font-medium text-crown-espresso">Responsive Design</h3>
                  <p className="text-sm text-crown-espresso/60 mt-1">
                    Our website adapts gracefully to different screen sizes, including mobile devices and tablets.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/80 border border-crown-espresso/10">
                <div className="w-10 h-10 rounded-full bg-crown-espresso/10 flex items-center justify-center shrink-0">
                  <Volume2 className="w-5 h-5 text-crown-gold" />
                </div>
                <div>
                  <h3 className="font-medium text-crown-espresso">Clear Typography</h3>
                  <p className="text-sm text-crown-espresso/60 mt-1">
                    Readable font sizes, adequate line spacing, and scalable text that respects browser settings.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">Technical Specifications</h2>
            <p className="text-crown-espresso/80 mb-4">
              Our website strives to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with disabilities.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-crown-espresso/80">
              <li>Semantic HTML used throughout for proper screen reader interpretation</li>
              <li>ARIA labels on interactive elements for enhanced accessibility</li>
              <li>Alternative text provided for decorative and informational images</li>
              <li>Form inputs properly labeled with associated labels</li>
              <li>Color contrast ratios meet WCAG AA standards</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">Known Limitations</h2>
            <p className="text-crown-espresso/80 mb-4">
              While we strive for full accessibility, you may notice some areas that are not yet fully optimized:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-crown-espresso/80">
              <li>Some older third-party integrations may not fully support accessibility features</li>
              <li>Interactive maps require user interaction to access content</li>
              <li>Animated elements are kept minimal and respect reduced motion preferences</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-crown-ink mb-4">Feedback & Support</h2>
            <p className="text-crown-espresso/80 mb-4">
              We welcome your feedback on the accessibility of our website. If you encounter any barriers or need assistance, please contact us:
            </p>
            <div className="bg-crown-cream/50 rounded-2xl p-6 border border-crown-espresso/10">
              <p className="font-medium text-crown-espresso">La Couronne Cafe</p>
              <p className="text-crown-espresso/80 text-sm mt-1">
                Phone: <a href="tel:+918431750295" className="text-crown-espresso hover:underline">084317 50295</a><br />
                Email: <a href="mailto:accessibility@lacouronneindia.com" className="text-crown-espresso hover:underline">accessibility@lacouronneindia.com</a>
              </p>
            </div>
          </section>

          <section className="border-t border-crown-espresso/10 pt-8">
            <p className="text-sm text-crown-espresso/50">
              We are committed to continuously improving accessibility. Any updates to this statement will be posted on this page.
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