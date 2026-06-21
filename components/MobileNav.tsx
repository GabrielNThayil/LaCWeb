"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const navItems = [
  { label: "Menu", href: "#menu" },
  { label: "Order", href: "#order" },
  { label: "About", href: "#about" },
  { label: "Specials", href: "#specials" },
  { label: "Private Space", href: "#private-space" },
  { label: "Events & Space Rental", href: "/events-space-rental" },
  { label: "Visit", href: "#visit" }
];

const phoneHref = "tel:+918431750295";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* ── Mobile Header Bar ── */}
      <header
        className={`fixed left-1/2 top-3 z-50 w-[min(95vw,540px)] -translate-x-1/2 rounded-2xl border px-4 py-3 transition-all duration-400 md:hidden ${
          scrolled
            ? "border-crown-espresso/25 bg-crown-paper/96 shadow-glow backdrop-blur-2xl"
            : "border-crown-espresso/20 bg-crown-paper/78 shadow-[0_14px_36px_rgba(32,24,15,.10)] backdrop-blur-xl"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="#home" className="flex items-center gap-2" onClick={closeMenu}>
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-crown-espresso text-crown-honey">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7z" />
                <path d="M5 20h14" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold text-crown-espresso">
              La Couronne
            </span>
          </Link>

          {/* Right side: Theme + CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/events-space-rental"
              className="inline-flex items-center gap-1.5 rounded-full bg-crown-espresso px-3 py-2 text-xs font-semibold text-crown-paper shadow-gold transition hover:bg-crown-caramel"
              onClick={closeMenu}
            >
              Book Space
              <ArrowRight className="h-3 w-3" />
            </Link>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-crown-espresso/20 bg-white/72 text-crown-espresso transition hover:bg-white"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-crown-ink/60 backdrop-blur-sm md:hidden"
              onClick={closeMenu}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="fixed bottom-0 right-0 top-0 z-[70] w-[min(85vw,360px)] overflow-y-auto rounded-l-3xl border-l border-crown-espresso/15 bg-crown-paper/98 shadow-[0_32px_80px_rgba(32,24,15,.25)] backdrop-blur-2xl md:hidden"
            >
              <div className="flex h-full flex-col p-6">
                {/* Drawer header */}
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-crown-espresso text-crown-honey">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7z" />
                        <path d="M5 20h14" />
                      </svg>
                    </div>
                    <span className="font-display text-lg font-semibold text-crown-espresso">
                      Menu
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={closeMenu}
                    aria-label="Close menu"
                    className="grid h-9 w-9 place-items-center rounded-full border border-crown-espresso/20 bg-white text-crown-espresso transition hover:bg-crown-espresso hover:text-crown-paper"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Navigation links */}
                <nav className="flex-1 space-y-1" aria-label="Mobile navigation">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="group flex items-center justify-between rounded-2xl px-5 py-4 text-lg font-semibold text-crown-espresso transition hover:bg-white active:bg-crown-espresso/8"
                      >
                        {item.label}
                        <ArrowRight className="h-4 w-4 text-crown-gold opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Drawer footer — quick actions */}
                <div className="mt-8 space-y-3 border-t border-crown-gold/20 pt-6">
                  <a
                    href={phoneHref}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-crown-espresso/25 bg-crown-espresso px-5 py-4 font-semibold text-crown-paper shadow-gold transition hover:bg-crown-caramel"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 19a19.79 19.79 0 01-10-3.07A2 2 0 011.82 12h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 19.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.92z" />
                    </svg>
                    Call — 084317 50295
                  </a>
                  <a
                    href="#visit"
                    onClick={closeMenu}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-crown-espresso/25 bg-white px-5 py-4 font-semibold text-crown-espresso transition hover:bg-cream"
                  >
                    <MapPin className="h-4 w-4 text-crown-gold" />
                    Get Directions
                  </a>
                </div>

                {/* Location note */}
                <p className="mt-5 text-center text-xs text-crown-espresso/55">
                  Cunningham Road, Vasanth Nagar, Bengaluru
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom Quick Bar (always visible on mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-crown-espresso/18 bg-crown-paper/97 px-3 pb-safe pt-2 shadow-[0_-8px_32px_rgba(32,24,15,.10)] backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around gap-1">
          <a
            href="#menu"
            className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-crown-espresso transition active:scale-95"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wider">Menu</span>
          </a>

          <a
            href="#about"
            className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-crown-espresso transition active:scale-95"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="5" />
              <path d="M3 21v-2a7 5 0 017-7h4a7 5 0 017 7v2" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wider">About</span>
          </a>

          <a
            href={phoneHref}
            className="flex flex-col items-center gap-1 rounded-2xl bg-crown-espresso px-4 py-2 text-crown-paper transition active:scale-95"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 19a19.79 19.79 0 01-10-3.07A2 2 0 011.82 12h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 19.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.92z" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wider">Call</span>
          </a>

          <a
            href="/events-space-rental"
            className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-crown-espresso transition active:scale-95"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wider">Events</span>
          </a>

          <a
            href="#private-space"
            className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-crown-espresso transition active:scale-95"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7z" />
              <path d="M5 20h14" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wider">Rent</span>
          </a>
        </div>
      </div>
    </>
  );
}