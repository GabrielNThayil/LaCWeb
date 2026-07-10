"use client";

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Check } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmitted(true);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-display font-semibold text-crown-ink mb-3">
            Get in Touch
          </h1>
          <p className="text-crown-espresso/60 max-w-md mx-auto">
            Have a question, feedback, or need assistance? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white/80 rounded-2xl p-6 border border-crown-espresso/10 text-center">
            <div className="w-12 h-12 rounded-full bg-crown-espresso/10 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-5 h-5 text-crown-gold" />
            </div>
            <h3 className="font-medium text-crown-espresso mb-2">Visit Us</h3>
            <p className="text-sm text-crown-espresso/60">
              19/8, Cunningham Rd<br />
              Vasanth Nagar, Bengaluru
            </p>
          </div>

          <div className="bg-white/80 rounded-2xl p-6 border border-crown-espresso/10 text-center">
            <div className="w-12 h-12 rounded-full bg-crown-espresso/10 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-5 h-5 text-crown-gold" />
            </div>
            <h3 className="font-medium text-crown-espresso mb-2">Call Us</h3>
            <a href="tel:+918431750295" className="text-sm text-crown-espresso/60 hover:text-crown-espresso">
              084317 50295
            </a>
          </div>

          <div className="bg-white/80 rounded-2xl p-6 border border-crown-espresso/10 text-center">
            <div className="w-12 h-12 rounded-full bg-crown-espresso/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-5 h-5 text-crown-gold" />
            </div>
            <h3 className="font-medium text-crown-espresso mb-2">Hours</h3>
            <p className="text-sm text-crown-espresso/60">
              Daily 8:30 AM - 10:00 PM
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white/80 rounded-3xl border border-crown-espresso/10 p-8">
          <h2 className="text-xl font-semibold text-crown-ink mb-6">Send us a message</h2>

          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-crown-ink mb-2">Message Sent!</h3>
              <p className="text-crown-espresso/60 mb-6">
                Thank you for reaching out. We&apos;ll get back to you shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', subject: 'general', message: '' });
                }}
                className="text-sm text-crown-espresso hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-crown-espresso mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-crown-espresso/20 bg-white/80 text-crown-espresso focus:outline-none focus:border-crown-gold focus:ring-2 focus:ring-crown-gold/20"
                    placeholder="Priyam Sharma"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crown-espresso mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-crown-espresso/20 bg-white/80 text-crown-espresso focus:outline-none focus:border-crown-gold focus:ring-2 focus:ring-crown-gold/20"
                    placeholder="priyam@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-crown-espresso mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-crown-espresso/20 bg-white/80 text-crown-espresso focus:outline-none focus:border-crown-gold focus:ring-2 focus:ring-crown-gold/20"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-crown-espresso mb-1">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-crown-espresso/20 bg-white/80 text-crown-espresso focus:outline-none focus:border-crown-gold focus:ring-2 focus:ring-crown-gold/20"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Issue</option>
                    <option value="booking">Private Booking</option>
                    <option value="feedback">Feedback</option>
                    <option value="catering">Catering Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-crown-espresso mb-1">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-crown-espresso/20 bg-white/80 text-crown-espresso focus:outline-none focus:border-crown-gold focus:ring-2 focus:ring-crown-gold/20 resize-none"
                  placeholder="How can we help you today?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-crown-espresso text-crown-paper font-medium hover:bg-crown-caramel transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-crown-paper/30 border-t-crown-paper rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* WhatsApp Quick Contact */}
        <div className="mt-8 text-center">
          <a
            href="https://wa.me/918431750295"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-green-500/20 bg-green-50/50 text-green-700 hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Quick chat on WhatsApp
          </a>
        </div>
      </div>

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