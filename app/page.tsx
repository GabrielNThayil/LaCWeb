"use client";

import Image from "next/image";
import Script from "next/script";
import { FormEvent, useEffect, useMemo, useState } from "react";
import OrderingModule from "../components/OrderingModule";
import MoodRecommender from "../components/MoodRecommender";
import { useSession, signIn, signOut } from "next-auth/react";
import { getUserOrders, getUserPreferences, updateUserPreferences } from "@/lib/storage";
import { PLACEHOLDERS } from "@/lib/blurs";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useScroll } from "framer-motion";
import { useTransform } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  CreditCard,
  Crown,
  Instagram,
  Loader2,
  MapPin,
  Moon,
  Phone,
  Sparkles,
  Star,
  Sun,
  Users
} from "lucide-react";

type BookingStatus = "idle" | "creating" | "paying" | "success" | "error";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const business = {
  name: "La Couronne Patisserie and Cafe",
  shortName: "La Couronne",
  address:
    "Ward No 78, Kareem Towers, 19/8, Cunningham Rd, Vasanth Nagar, Bengaluru, Karnataka 560001",
  phone: "084317 50295",
  phoneHref: "tel:+918431750295",
  timings: "8:30 AM-10:00 PM",
  rating: "4.8",
  googleCount: "655 Google ratings",
  costForTwo: "INR 500 for two",
  maps:
    "https://www.google.com/maps/search/?api=1&query=La%20Couronne%20Patisserie%20and%20Cafe%2019%2F8%20Cunningham%20Road%20Bengaluru"
};

const navItems = [
  { label: "Menu", href: "#menu" },
  { label: "Order", href: "#order" },
  { label: "About", href: "#about" },
  { label: "Specials", href: "#specials" },
  { label: "Private Space", href: "#private-space" },
  { label: "Events & Space Rental", href: "/events-space-rental" },
  { label: "Visit", href: "#visit" }
];

const heroImage = "/pics/Interior 1.png";

const heroCarousel = [
  {
    eyebrow: "Private bookings",
    title: "INR 3000 / hour",
    image: "/pics/Xterior1.png"
  },
  {
    eyebrow: "Patisserie mornings",
    title: "French-style bakes",
    image: "/pics/Interior 2.png"
  },
  {
    eyebrow: "Cafe rituals",
    title: "Coffee, softly staged",
    image: "/pics/coffee.png"
  }
];

const menuItems = [
  {
    name: "House Coffee",
    category: "coffee",
    price: "INR 180",
    detail: "Freshly brewed house blend with a smooth, balanced taste.",
    image: "/pics/coffee.png"
  },
  {
    name: "Burger",
    category: "brunch",
    price: "INR 290",
    detail: "Juicy patty with fresh vegetables and house sauce.",
    image: "/pics/Burger Landscape.png"
  },
  {
    name: "Hot Chocolate",
    category: "drinks",
    price: "INR 220",
    detail: "Rich Belgian chocolate with steamed milk and whipped cream.",
    image: "/pics/Hot Chocolate Landscape.png"
  },
  {
    name: "Korean Bun",
    category: "brunch",
    price: "INR 150",
    detail: "Soft steamed bun with sweet red bean filling.",
    image: "/pics/Korean Bun.png"
  },
  {
    name: "Burnt Basque Cheesecake",
    category: "desserts",
    price: "INR 310",
    detail: "Deeply caramelized top with a molten cream cheese center.",
    image: "/pics/Burnt Basque Cheesecake Landscape.png"
  },
  {
    name: "Tres Leches",
    category: "desserts",
    price: "INR 280",
    detail: "Classic Latin American cake soaked in three kinds of milk.",
    image: "/pics/Tres Leches.png"
  }
];

const specials = [
  {
    title: "Burnt Basque Cheesecake",
    copy: "A deeply caramelized cheesecake with a molten cream cheese center.",
    image: "/pics/Burnt Basqu 2.png"
  },
  {
    title: "Hot Chocolate",
    copy: "Rich Belgian chocolate with steamed milk and whipped cream.",
    image: "/pics/Hot Chocolate Landscape.png"
  },
  {
    title: "Tres Leches",
    copy: "Classic Latin American cake soaked in three kinds of milk.",
    image: "/pics/Tres Leches.png"
  }
];

const gallery = [
  "/pics/Interior 1.png",
  "/pics/coffee.png",
  "/pics/Hot Chocolate Landscape.png",
  "/pics/Interior 2.png",
  "/pics/Interior 3.png",
  "/pics/Xterior1.png"
];

const reviews = [
  {
    name: "Priyam",
    rating: "5.0",
    text: "Great coffee with great food."
  },
  {
    name: "Elina",
    rating: "5.0",
    text: "Lovely place with beautiful staff. Tiramisu was yummy and the tropical heart brew was refreshing."
  },
  {
    name: "Vikas Patel",
    rating: "5.0",
    text: "Very nice presentation of food and service is awesome."
  }
];

const rentalUses = [
  "Birthdays",
  "Acoustic gigs",
  "Workshops",
  "Meetings",
  "Private gatherings",
  "Photoshoots",
  "Creator events"
];

const timeSlots = ["09:00", "11:30", "14:00", "16:30", "19:00"];
const filters = ["all", "coffee", "desserts", "brunch", "drinks"];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [specialIndex, setSpecialIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
  const [eventType, setEventType] = useState(rentalUses[0]);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>("idle");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const { data: session, status: sessionStatus } = useSession();
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, prefersReducedMotion ? 0 : 160]);
  const heroScale = useTransform(scrollY, [0, 800], [1, prefersReducedMotion ? 1 : 1.08]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    const timer = window.setTimeout(() => setLoading(false), 1050);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("la-couronne-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(savedTheme ? savedTheme === "dark" : prefersDark);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("la-couronne-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setHeroSlide((current) => (current + 1) % heroCarousel.length),
      5200
    );
    return () => window.clearInterval(timer);
  }, []);

  const filteredMenu = useMemo(
    () =>
      activeFilter === "all"
        ? menuItems
        : menuItems.filter((item) => item.category === activeFilter),
    [activeFilter]
  );

  const rentalTotal = hours * 3000;
  const isBookingLoading = bookingStatus === "creating" || bookingStatus === "paying";

  const nextSpecial = () =>
    setSpecialIndex((current) => (current + 1) % specials.length);
  const previousSpecial = () =>
    setSpecialIndex((current) =>
      current === 0 ? specials.length - 1 : current - 1
    );

  const handleSpaceBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBookingStatus("creating");
    setBookingMessage("Preparing secure checkout...");

    try {
      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is still loading. Please try again.");
      }

      const orderResponse = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingName,
          phone: bookingPhone,
          date: bookingDate,
          slot: selectedSlot,
          hours,
          eventType
        })
      });
      const order = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(order.error || "Unable to create payment order.");
      }

      setBookingStatus("paying");
      setBookingMessage("Opening Razorpay checkout...");

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: business.name,
        description: `Private space rental - ${hours} hour${hours > 1 ? "s" : ""}`,
        order_id: order.orderId,
        prefill: {
          name: bookingName,
          contact: bookingPhone
        },
        notes: {
          date: bookingDate,
          slot: selectedSlot,
          hours: String(hours),
          eventType
        },
        theme: {
          color: "#61481C"
        },
        handler: async (payment: RazorpayResponse) => {
          const verifyResponse = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payment)
          });
          const result = await verifyResponse.json();
          if (!verifyResponse.ok) {
            setBookingStatus("error");
            setBookingMessage(result.error || "Payment verification failed.");
            return;
          }
          setBookingStatus("success");
          setBookingMessage(
            `Booking confirmed for ${bookingDate} at ${selectedSlot}. Confirmation: ${result.confirmationId}`
          );

          // Update user's preferences for private space booking
          if (session) {
            const userId = session.user.id;
            const currentPrefs = getUserPreferences(userId);

            // Add private space booking to preferred visit times based on the selected slot
            const slotHour = parseInt(selectedSlot.split(":")[0]);
            let preferredTime = '';
            if (slotHour >= 6 && slotHour < 12) {
              preferredTime = 'morning';
            } else if (slotHour >= 12 && slotHour < 17) {
              preferredTime = 'afternoon';
            } else {
              preferredTime = 'evening';
            }

            // Update visit count and preferences
            const updatedPrefs = {
              ...currentPrefs,
              preferredVisitTimes: Array.from(new Set([...currentPrefs.preferredVisitTimes, preferredTime]))
                .filter(Boolean) // Remove any empty strings
                .slice(0, 3), // Keep top 3
              // For private space bookings, we might want to add event type to favorites or track separately
              // For now, we'll just track that they used the private space
              // In a real app, you might have a separate field for event types or visit purposes
            };

            updateUserPreferences(userId, updatedPrefs);
          }
        },
        modal: {
          ondismiss: () => {
            setBookingStatus("idle");
            setBookingMessage("Checkout closed before payment.");
          }
        }
      });

      checkout.open();
    } catch (error) {
      setBookingStatus("error");
      setBookingMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  return (
    <main className={`grain luxury-cursor relative min-h-screen overflow-hidden bg-crown-paper text-crown-ink transition-colors duration-500 ${isDarkMode ? "theme-dark" : ""}`}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-crown-paper"
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
          >
            <div className="min-w-[280px] rounded-[2rem] border border-crown-gold/25 bg-white/45 p-8 shadow-glow backdrop-blur-2xl">
              <div className="mb-6 flex items-center gap-3">
                <Crown className="h-8 w-8 text-crown-gold" />
                <span className="font-display text-3xl font-semibold">
                  La Couronne
                </span>
              </div>
              <div className="space-y-3">
                <div className="shimmer h-4 rounded-full bg-crown-gold/20" />
                <div className="shimmer h-4 w-4/5 rounded-full bg-crown-gold/20" />
                <div className="shimmer h-4 w-2/3 rounded-full bg-crown-gold/20" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className={`fixed left-1/2 top-4 z-50 w-[min(94vw,1180px)] -translate-x-1/2 rounded-full border px-4 py-3 transition-all duration-500 md:hidden lg:flex ${
          scrolled
            ? "border-crown-espresso/25 bg-crown-paper/94 shadow-glow backdrop-blur-2xl"
            : "border-crown-espresso/20 bg-crown-paper/78 shadow-[0_14px_36px_rgba(32,24,15,.10)] backdrop-blur-xl"
        }`}
      >
        <div className="flex w-full items-center justify-between gap-4">
          <a href="#home" className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-crown-espresso text-crown-honey">
              <Crown className="h-5 w-5" />
            </span>
            <span className="hidden lg:inline font-display text-2xl font-semibold leading-none">
              La Couronne
            </span>
          </a>
          <div className="hidden lg:flex items-center gap-1">
            {/* Dynamic nav items with auth */}
            {session ? (
              <>
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-full px-3 py-2 text-sm font-semibold text-crown-espresso/90 transition duration-300 hover:bg-white hover:text-crown-ink"
                  >
                    {item.label}
                  </a>
                ))}
                <button
                  onClick={() => signOut()}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-crown-espresso/90 transition duration-300 hover:bg-white hover:text-crown-ink"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-full px-3 py-2 text-sm font-semibold text-crown-espresso/90 transition duration-300 hover:bg-white hover:text-crown-ink"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="/auth/signin"
                  className="rounded-full px-3 py-2 text-sm font-semibold text-crown-espresso/90 transition duration-300 hover:bg-white hover:text-crown-ink"
                >
                  Sign in
                </a>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsDarkMode((current) => !current)}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={isDarkMode ? "Light mode" : "Dark mode"}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-crown-espresso/20 bg-white/72 text-crown-espresso transition duration-300 hover:-translate-y-0.5 hover:border-crown-espresso/45 hover:bg-white"
          >
            {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
          <a
            href="/events-space-rental"
            className="group inline-flex items-center gap-2 rounded-full bg-crown-espresso px-4 py-2 text-sm font-semibold text-crown-paper shadow-gold transition duration-300 hover:-translate-y-0.5 hover:bg-crown-caramel"
          >
            Book Space
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>
        </div>
      </nav>

      <section id="home" className="relative min-h-[100vh] overflow-hidden px-4 pt-28">
        <motion.div className="absolute inset-0 -z-10" style={{ y: heroY, scale: heroScale }}>
          <Image
            src={heroImage}
            alt="Elegant cafe interior with warm light"
            fill
            priority
            placeholder="blur"
            blurDataURL={PLACEHOLDERS.paper}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-crown-paper/40 via-crown-paper/20 to-crown-paper/80" />
        </motion.div>

        <div className="mx-auto max-w-7xl">
          {/* Welcome text - moved to corner */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, delay: 0.15 }}
            className="mb-6"
          >
            {session ? (
              <div className="inline-block rounded-2xl border border-crown-espresso/20 bg-white/85 px-5 py-3 shadow-lg backdrop-blur">
                <p className="text-sm text-crown-espresso/80">
                  Welcome back, <span className="font-semibold text-crown-ink">{session.user.name}</span>
                </p>
              </div>
            ) : (
              <a href="/auth/signin" className="inline-block rounded-full border border-crown-espresso/25 bg-white/78 px-4 py-2 text-sm text-crown-espresso/90 shadow-[0_8px_24px_rgba(32,24,15,.08)] backdrop-blur-xl transition hover:bg-white">
                Sign in for personalized recommendations →
              </a>
            )}
          </motion.div>

          {/* Main hero content with carousel */}
          <div className="grid min-h-[75vh] gap-8 lg:grid-cols-[1fr_400px] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.2 }}
            >
              <h1 className="font-display text-5xl font-semibold leading-[0.92] tracking-normal text-crown-ink sm:text-6xl lg:text-8xl">
                La Couronne Cafe
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-crown-espresso/95 sm:text-xl">
                A warm luxury patisserie and cafe in Vasanth Nagar for French-style
                desserts, crafted beverages, and intimate private gatherings.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#menu"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-crown-espresso px-7 py-4 font-semibold text-crown-paper shadow-gold transition duration-300 hover:-translate-y-1 hover:bg-crown-caramel"
                >
                  Explore Menu
                  <Coffee className="h-5 w-5 transition group-hover:rotate-12" />
                </a>
                <a
                  href="#private-space"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-crown-espresso/35 bg-white/78 px-7 py-4 font-semibold text-crown-espresso shadow-[0_12px_34px_rgba(32,24,15,.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white"
                >
                  Reserve the Space
                  <CalendarDays className="h-5 w-5" />
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-crown-espresso/95">
                <span className="rounded-full border border-crown-espresso/15 bg-white/76 px-4 py-2 backdrop-blur">
                  {business.rating} star | {business.googleCount}
                </span>
                <span className="rounded-full border border-crown-espresso/15 bg-white/76 px-4 py-2 backdrop-blur">
                  {business.timings}
                </span>
                <span className="rounded-full border border-crown-espresso/15 bg-white/76 px-4 py-2 backdrop-blur">
                  {business.costForTwo}
                </span>
              </div>
            </motion.div>

            {/* Hero carousel - moved up and more prominent */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.35 }}
            >
              <div className="noise-panel rounded-[2rem] border border-crown-espresso/20 p-4 shadow-glow backdrop-blur-2xl">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={heroCarousel[heroSlide].image}
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.75, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={heroCarousel[heroSlide].image}
                        alt={heroCarousel[heroSlide].title}
                        fill
                        placeholder="blur"
                        blurDataURL={PLACEHOLDERS.paper}
                        sizes="400px"
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-crown-espresso/20 bg-crown-paper/90 p-5 shadow-[0_12px_34px_rgba(32,24,15,.16)] backdrop-blur-2xl">
                    <p className="text-sm uppercase tracking-[0.34em] text-crown-caramel">
                      {heroCarousel[heroSlide].eyebrow}
                    </p>
                    <p className="mt-2 font-display text-2xl font-semibold">
                      {heroCarousel[heroSlide].title}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-2">
                        {heroCarousel.map((slide, index) => (
                          <button
                            key={slide.title}
                            type="button"
                            onClick={() => setHeroSlide(index)}
                            aria-label={`Show slide ${index + 1}: ${slide.title}`}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              heroSlide === index
                                ? "w-7 bg-crown-espresso"
                                : "w-2 bg-crown-gold/45 hover:bg-crown-gold"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setHeroSlide((current) =>
                              current === 0 ? heroCarousel.length - 1 : current - 1
                            )
                          }
                          aria-label="Previous hero slide"
                          className="grid h-8 w-8 place-items-center rounded-full border border-crown-espresso/20 text-crown-espresso transition hover:bg-crown-espresso hover:text-crown-paper"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setHeroSlide((current) => (current + 1) % heroCarousel.length)
                          }
                          aria-label="Next hero slide"
                          className="grid h-8 w-8 place-items-center rounded-full border border-crown-espresso/20 text-crown-espresso transition hover:bg-crown-espresso hover:text-crown-paper"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="masked-fade border-y border-crown-gold/20 bg-crown-espresso py-4 text-crown-paper overflow-hidden">
        <motion.div
          className="flex min-w-max gap-10 text-sm font-semibold uppercase tracking-[0.38em]"
          animate={prefersReducedMotion ? {} : { x: ["0%", "-50%"] }}
          transition={prefersReducedMotion ? { duration: 0 } : { repeat: Infinity, duration: 24, ease: "linear" }}
        >
          {[...Array(2)].map((_, loop) => (
            <div key={loop} className="flex gap-10">
              <span>French desserts</span>
              <span>Matcha</span>
              <span>Custom cakes</span>
              <span>Private events</span>
              <span>Breakfast to evening cafe</span>
            </div>
          ))}
        </motion.div>
      </section>

      <SectionHeader
        id="menu"
        eyebrow="Featured Menu"
        title="Real cafe signatures, refined for the crown."
        copy="A tighter edit inspired by the public menu: croissants, matcha, mochas, mocktails, cheesecakes, and the tiramisu guests keep mentioning."
      />
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-5 py-3 text-sm font-semibold capitalize transition duration-300 ${
                activeFilter === filter
                  ? "border-crown-espresso bg-crown-espresso text-crown-paper shadow-gold"
                  : "border-crown-espresso/20 bg-white/82 text-crown-espresso hover:-translate-y-0.5 hover:border-crown-espresso/40 hover:bg-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredMenu.map((item) => (
              <motion.article
                layout
                key={item.name}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.96 }}
                whileHover={{ y: -8 }}
                className="group overflow-hidden rounded-[1.5rem] border border-crown-espresso/18 bg-white/88 shadow-[0_14px_45px_rgba(97,72,28,.12)] backdrop-blur-xl"
              >
                <div className="relative aspect-[1.2] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    placeholder="blur"
                    blurDataURL={PLACEHOLDERS.paper}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute right-4 top-4 rounded-full bg-crown-paper/85 px-4 py-2 font-display text-xl font-semibold text-crown-espresso backdrop-blur">
                    {item.price}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-crown-gold">
                    {item.category}
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-semibold">
                    {item.name}
                  </h3>
                  <p className="mt-3 leading-7 text-crown-espresso/88">
                    {item.detail}
                  </p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#order" className="premium-link">
            Order Direct <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <OrderingModule />

      {/* Mood-based recommendations */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <MoodRecommender />
      </section>

      <section id="about" className="relative overflow-hidden bg-crown-cream px-4 py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[.85fr_1.15fr] md:items-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-glow"
          >
            <Image
              src="/pics/coffee.png"
              alt="Warm artisan coffee service"
              fill
              placeholder="blur"
              blurDataURL={PLACEHOLDERS.cream}
              sizes="(max-width: 768px) 100vw, 42vw"
              className="object-cover"
            />
          </motion.div>
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.34em] text-crown-gold">
              About La Couronne
            </p>
            <h2 className="font-display text-5xl font-semibold leading-tight sm:text-7xl">
              A Cunningham Road cafe for pastry, coffee, and intimate occasions.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-crown-espresso/90">
              The public listings describe La Couronne as a patisserie and cafe
              known for bakery, beverages, desserts, breakfast, lunch, dinner,
              indoor seating, and home delivery. The website keeps that everyday
              cafe rhythm while adding a premium private-space booking flow.
            </p>
            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {["Bakery + desserts", "Breakfast to dinner", "Private cafe hire"].map(
                (value) => (
                  <div
                    key={value}
                    className="rounded-3xl border border-crown-espresso/18 bg-white/82 p-5 shadow-[0_12px_35px_rgba(97,72,28,.09)] backdrop-blur"
                  >
                    <Sparkles className="mb-4 h-5 w-5 text-crown-gold" />
                    <p className="font-semibold text-crown-espresso">{value}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <SectionHeader
        id="specials"
        eyebrow="Signature Specials"
        title="Best sellers with a soft Bengaluru glow."
        copy="A compact carousel for items and categories surfaced in public menu and review data."
      />
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-[1.25fr_.75fr] md:items-stretch">
          <AnimatePresence mode="wait">
            <motion.div
              key={specials[specialIndex].title}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45 }}
              className="relative min-h-[440px] overflow-hidden rounded-[2rem] shadow-glow"
            >
              <Image
                src={specials[specialIndex].image}
                alt={specials[specialIndex].title}
                fill
                placeholder="blur"
                blurDataURL={PLACEHOLDERS.espresso}
                sizes="(max-width: 768px) 100vw, 62vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-crown-espresso/78 via-crown-espresso/12 to-transparent" />
              <div className="absolute bottom-0 max-w-2xl p-7 text-crown-paper sm:p-10">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.34em] text-crown-honey">
                  House note
                </p>
                <h3 className="font-display text-5xl font-semibold">
                  {specials[specialIndex].title}
                </h3>
                <p className="mt-4 text-lg leading-8 text-crown-paper/85">
                  {specials[specialIndex].copy}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="rounded-[2rem] border border-crown-espresso/18 bg-white/88 p-6 shadow-[0_16px_50px_rgba(97,72,28,.12)] backdrop-blur-xl">
            <div className="flex gap-3">
              <button onClick={previousSpecial} aria-label="Previous special" className="icon-button">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={nextSpecial} aria-label="Next special" className="icon-button">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 space-y-4">
              {specials.map((special, index) => (
                <button
                  key={special.title}
                  onClick={() => setSpecialIndex(index)}
                  className={`w-full rounded-3xl border p-5 text-left transition duration-300 ${
                    index === specialIndex
                      ? "border-crown-gold bg-crown-espresso text-crown-paper"
                      : "border-crown-gold/20 bg-crown-paper/40 text-crown-espresso hover:bg-white/70"
                  }`}
                >
                  <span className="font-display text-2xl font-semibold">
                    {special.title}
                  </span>
                  <span className="mt-2 block text-sm opacity-75">
                    0{index + 1} / 03
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="private-space" className="relative overflow-hidden bg-crown-espresso px-4 py-24 text-crown-paper">
        <div className="absolute inset-0 opacity-25">
          <Image
            src="/pics/Interior 1.png"
            alt="Premium cafe lounge ambience"
            fill
            placeholder="blur"
            blurDataURL={PLACEHOLDERS.espresso}
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-crown-espresso via-crown-espresso/88 to-crown-caramel/70" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.92fr_1.08fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.34em] text-crown-honey">
              Private Space Rental
            </p>
            <h2 className="font-display text-5xl font-semibold leading-tight sm:text-7xl">
              Take over the cafe for your next intimate moment.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-crown-paper/82">
              Reserve La Couronne for up to two hours for small-format
              celebrations, creative sessions, workshops, meetings, and cafe
              culture events.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.28em] text-crown-honey">
                  Rate
                </p>
                <p className="mt-3 font-display text-5xl font-semibold">
                  INR 3000
                </p>
                <p className="mt-2 text-crown-paper/72">per hour</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.28em] text-crown-honey">
                  Duration
                </p>
                <p className="mt-3 font-display text-5xl font-semibold">
                  2 hours
                </p>
                <p className="mt-2 text-crown-paper/72">maximum booking</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {rentalUses.map((use) => (
                <span
                  key={use}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-xl"
                >
                  {use === "Photoshoots" ? <Camera className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                  {use}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSpaceBooking}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-[2rem] border border-white/15 bg-crown-paper/92 p-5 text-crown-ink shadow-glow backdrop-blur-2xl sm:p-7"
          >
            <div className="flex flex-col gap-4 border-b border-crown-gold/20 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-crown-gold">
                  Booking checkout
                </p>
                <h3 className="mt-3 font-display text-4xl font-semibold">
                  Reserve the Space
                </h3>
              </div>
              <div className="rounded-3xl bg-crown-espresso px-5 py-4 text-crown-paper">
                <p className="text-xs uppercase tracking-[0.22em] text-crown-honey">
                  Total
                </p>
                <p className="font-display text-3xl font-semibold">
                  INR {rentalTotal.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="field-label">
                Name
                <input
                  required
                  value={bookingName}
                  onChange={(event) => setBookingName(event.target.value)}
                  placeholder="Your name"
                  className="field-input"
                />
              </label>
              <label className="field-label">
                Phone
                <input
                  required
                  value={bookingPhone}
                  onChange={(event) => setBookingPhone(event.target.value)}
                  placeholder="Mobile number"
                  className="field-input"
                />
              </label>
              <label className="field-label">
                Date
                <input
                  required
                  type="date"
                  value={bookingDate}
                  onChange={(event) => setBookingDate(event.target.value)}
                  className="field-input"
                />
              </label>
              <label className="field-label">
                Event
                <select
                  value={eventType}
                  onChange={(event) => setEventType(event.target.value)}
                  className="field-input"
                >
                  {rentalUses.map((use) => (
                    <option key={use}>{use}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-crown-caramel">
                Time slot
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition duration-300 ${
                      selectedSlot === slot
                        ? "border-crown-espresso bg-crown-espresso text-crown-paper"
                        : "border-crown-gold/25 bg-white/60 text-crown-espresso hover:bg-white"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-crown-caramel">
                Duration
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setHours(value)}
                    className={`rounded-3xl border p-5 text-left transition duration-300 ${
                      hours === value
                        ? "border-crown-espresso bg-crown-espresso text-crown-paper"
                        : "border-crown-gold/25 bg-white/60 text-crown-espresso hover:bg-white"
                    }`}
                  >
                    <span className="font-display text-3xl font-semibold">
                      {value} hour{value > 1 ? "s" : ""}
                    </span>
                    <span className="mt-2 block text-sm opacity-75">
                      INR {(value * 3000).toLocaleString("en-IN")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isBookingLoading}
              className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-crown-espresso px-7 py-4 font-semibold text-crown-paper shadow-gold transition duration-300 hover:-translate-y-1 hover:bg-crown-caramel disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isBookingLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CreditCard className="h-5 w-5" />
              )}
              Reserve the Space
            </button>
            <p className="mt-4 text-center text-sm text-crown-espresso/68">
              Secure Razorpay checkout supports UPI, cards, wallets, and net banking.
            </p>
            {bookingMessage && (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  bookingStatus === "success"
                    ? "border-green-600/25 bg-green-50 text-green-800"
                    : bookingStatus === "error"
                      ? "border-red-600/25 bg-red-50 text-red-800"
                      : "border-crown-gold/25 bg-white/70 text-crown-espresso"
                }`}
              >
                {bookingMessage}
              </div>
            )}
          </motion.form>
        </div>
      </section>

      <SectionHeader
        id="gallery"
        eyebrow="Gallery"
        title="Cafe light, pastry details, and intimate-table energy."
        copy="The gallery keeps the original editorial rhythm while the live listing links point guests toward current platform photos."
      />
      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 pb-24 md:grid-cols-4 md:gap-4">
        {gallery.map((image, index) => (
          <motion.div
            key={image}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: index * 0.05 }}
            className={`relative overflow-hidden rounded-[1.4rem] shadow-[0_14px_40px_rgba(97,72,28,.1)] ${
              index === 0 || index === 5
                ? "aspect-square md:col-span-2 md:row-span-2"
                : "aspect-square"
            }`}
          >
            <Image
              src={image}
              alt={`La Couronne cafe gallery ${index + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition duration-700 hover:scale-110"
            />
          </motion.div>
        ))}
      </section>

      <section className="bg-crown-espresso px-4 py-24 text-crown-paper">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.34em] text-crown-honey">
                Reviews
              </p>
              <h2 className="font-display text-5xl font-semibold sm:text-7xl">
                Notes from real guests.
              </h2>
            </div>
            <div className="text-crown-honey">
              <div className="flex gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="mt-2 text-sm text-crown-paper/72">
                {business.rating} from {business.googleCount}
              </p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review, index) => (
              <motion.article
                key={review.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-[1.6rem] border border-white/12 bg-white/10 p-7 shadow-[0_18px_60px_rgba(0,0,0,.16)] backdrop-blur-xl"
              >
                <p className="font-display text-3xl leading-tight">
                  &quot;{review.text}&quot;
                </p>
                <p className="mt-7 text-sm font-bold uppercase tracking-[0.28em] text-crown-honey">
                  {review.name} | {review.rating}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="visit" className="px-4 py-24">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-crown-espresso/20 bg-white/90 p-8 shadow-glow backdrop-blur-xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.34em] text-crown-gold">
              Location + Contact
            </p>
            <h2 className="font-display text-5xl font-semibold leading-tight">
              Meet us on Cunningham Road.
            </h2>
            <div className="mt-8 space-y-5 text-crown-espresso/94">
              <p className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-crown-gold" />
                {business.address}
              </p>
              <p className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 text-crown-gold" />
                Daily {business.timings}.
              </p>
              <p className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 text-crown-gold" />
                <a href={business.phoneHref}>{business.phone}</a>
              </p>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={business.phoneHref} className="premium-link">
                Call Cafe <Phone className="h-4 w-4" />
              </a>
              <a href="#order" className="premium-link">
                Order Delivery <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="min-h-[420px] overflow-hidden rounded-[2rem] border border-crown-gold/20 shadow-glow">
            <iframe
              title="La Couronne Cafe map"
              src="https://maps.google.com/maps?q=La%20Couronne%20Patisserie%20and%20Cafe%2019%2F8%20Cunningham%20Road%20Bengaluru&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="h-full min-h-[420px] w-full"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-crown-espresso/20 bg-white/32 px-4 pb-28 pt-10 md:pb-10 md:pb-10">
        <div className="mx-auto grid max-w-7xl gap-8 text-crown-espresso/88 md:grid-cols-[1.2fr_.8fr_.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-crown-gold" />
              <span className="font-display text-3xl font-semibold text-crown-espresso">
                La Couronne Cafe
              </span>
            </div>
            <p className="mt-4 max-w-md leading-7">
              {business.address}
            </p>
            <p className="mt-2 font-semibold">{business.phone}</p>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-crown-gold">
              Order + Reserve
            </p>
            <div className="flex flex-col items-start gap-3">
              <a href="#order" className="hover:text-crown-espresso">
                Direct online ordering
              </a>
              <a href="#private-space" className="hover:text-crown-espresso">
                Private space rental
              </a>
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-crown-gold">
              Legal
            </p>
            <div className="flex flex-col items-start gap-3 text-sm">
              <a href="/privacy" className="hover:text-crown-espresso">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-crown-espresso">
                Terms of Service
              </a>
              <a href="/contact" className="hover:text-crown-espresso">
                Contact Us
              </a>
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-crown-gold">
              Social
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#home"
                aria-label="Instagram"
                className="grid h-11 w-11 place-items-center rounded-full border border-crown-espresso/20 bg-white/72 transition hover:-translate-y-1 hover:bg-white"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a href={business.maps} target="_blank" className="rounded-full border border-crown-espresso/20 bg-white/72 px-5 py-3 text-sm font-semibold transition hover:-translate-y-1 hover:bg-white">
                Directions
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionHeader({
  id,
  eyebrow,
  title,
  copy
}: {
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 pb-10 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        className="max-w-3xl"
      >
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.34em] text-crown-gold">
          {eyebrow}
        </p>
        <h2 className="font-display text-5xl font-semibold leading-tight sm:text-7xl">
          {title}
        </h2>
        <p className="mt-5 text-lg leading-8 text-crown-espresso/88">{copy}</p>
      </motion.div>
    </section>
  );
}
