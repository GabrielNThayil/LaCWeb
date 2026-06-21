"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  Coffee,
  CreditCard,
  Crown,
  Loader2,
  MapPin,
  Phone,
  Sparkles,
  Users
} from "lucide-react";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/order-catalog";
import { getUserById } from "@/lib/storage";
import Link from "next/link";

type BookingStatus = "idle" | "creating" | "paying" | "success" | "error";

const rentalUses = [
  "Birthdays",
  "Workshops",
  "Meetings",
  "Creator events",
  "Photoshoots",
  "Acoustic sessions"
];

const timeSlots = ["09:00", "11:30", "14:00", "16:30", "19:00"];
const RENTAL_RATE = 3000;
const MAX_HOURS = 2;

export default function EventsSpaceRentalPage() {
  const [hours, setHours] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
  const [eventType, setEventType] = useState(rentalUses[0]);
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>("idle");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const { data: session } = useSession();

  // Prefill form with user data when logged in
  useEffect(() => {
    if (session?.user?.id) {
      const user = getUserById(session.user.id);
      if (user) {
        setBookingName(user.name);
      }
    }
  }, [session]);

  const rentalTotal = hours * RENTAL_RATE;
  const isBookingLoading = bookingStatus === "creating" || bookingStatus === "paying";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatus("creating");
    setBookingMessage("Preparing booking...");

    // Validate inputs
    if (!bookingName || !bookingPhone || !bookingDate) {
      setBookingStatus("error");
      setBookingMessage("Please fill in all required fields.");
      return;
    }

    if (hours < 1 || hours > MAX_HOURS) {
      setBookingStatus("error");
      setBookingMessage(`Booking duration must be between 1 and ${MAX_HOURS} hours.`);
      return;
    }

    // Simulate API call to create booking
    try {
      // In a real app, this would be an API call to your backend
      // For now, we'll simulate a successful booking
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate a booking confirmation
      const confirmationId = `LC-${Date.now().toString().slice(-6).toUpperCase()}`;

      setBookingStatus("success");
      setBookingMessage(
        `Booking confirmed! Your space is reserved for ${bookingDate} at ${selectedSlot}. ` +
        `Confirmation: ${confirmationId}`
      );

      // Clear form after successful booking (optional)
      // setBookingName("");
      // setBookingPhone("");
      // setBookingDate("");
      // setNotes("");
    } catch (error) {
      setBookingStatus("error");
      setBookingMessage("Failed to create booking. Please try again.");
    }
  };

  return (
    <div className="bg-crown-cream min-h-screen">
      {/* Sticky back navigation */}
      <div className="sticky top-0 z-50 w-full border-b border-crown-espresso/10 bg-crown-paper/90 px-4 py-4 shadow-sm backdrop-blur-xl">
        <Link
          href="/#private-space"
          className="mx-auto flex max-w-7xl items-center gap-2 text-sm font-semibold text-crown-espresso transition hover:text-crown-caramel"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to La Couronne
        </Link>
      </div>

      <section className="relative overflow-hidden px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.34em] text-crown-honey">
              Events & Space Rental
            </p>
            <h2 className="font-display text-5xl font-semibold leading-tight sm:text-7xl">
              Host your special event at La Couronne
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-crown-espresso/90">
              Our intimate private space is perfect for birthdays, workshops, meetings,
              creator events, photoshoots, and acoustic sessions. Available for up to 2 hours.
            </p>
          </div>
          <a
            href="#private-space"
            className="inline-flex items-center gap-2 rounded-full bg-crown-espresso px-4 py-2 text-sm font-semibold text-crown-paper hover:bg-crown-caramel transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            Quick Booking
          </a>
        </div>

        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          {/* Booking Form */}
          <div className="rounded-[2rem] border border-crown-espresso/20 bg-white/92 p-6 shadow-glow backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-[0.34em] text-crown-gold">
                  Booking Details
                </p>
                <h3 className="font-display text-4xl font-semibold text-crown-ink">
                  Reserve the Space
                </h3>
              </div>

              {/* Guest Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">
                    Name
                    <input
                      required
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="Your name"
                      className="field-input"
                    />
                  </label>
                </div>
                <div>
                  <label className="field-label">
                    Phone
                    <input
                      required
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      placeholder="Mobile number"
                      className="field-input"
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">
                    Date
                    <input
                      required
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="field-input"
                      min={new Date().toISOString().split("T")[0]} // Minimum today
                    />
                  </label>
                </div>
                <div>
                  <label className="field-label">
                    Time Slot
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="field-input"
                    >
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">
                    Event Type
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="field-input"
                    >
                      {rentalUses.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div>
                  <label className="field-label">
                    Guest Count
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                      placeholder="Number of guests"
                      className="field-input"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="field-label">
                  Notes
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests or details about your event"
                    className="field-input min-h-[96px] resize-none"
                  />
                </label>
              </div>

              {/* Pricing Summary */}
              <div className="border-t border-crown-gold/20 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-crown-espresso/80">
                    <span>Space Rental</span>
                    <span>{formatCurrency(RENTAL_RATE)}/hour</span>
                  </div>
                  <div className="flex items-center justify-between text-crown-espresso/80">
                    <span>Duration</span>
                    <span>
                      {hours} hour{hours > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-crown-gold/10 pt-4">
                    <span className="font-semibold">Total</span>
                    <span className="font-display text-3xl text-crown-ink">
                      {formatCurrency(rentalTotal)}
                    </span>
                  </div>
                  {hours > MAX_HOURS && (
                    <p className="mt-2 text-xs text-red-600">
                      Maximum booking duration is {MAX_HOURS} hour{MAX_HOURS > 1 ? "s" : ""}.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isBookingLoading || hours < 1 || hours > MAX_HOURS}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-full bg-crown-espresso px-6 py-4 font-semibold text-crown-paper hover:bg-crown-caramel transition-colors disabled:opacity-50"
              >
                {isBookingLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing booking...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Space Details */}
          <div className="rounded-[2rem] border border-crown-espresso/20 bg-white/88 p-6 shadow-glow backdrop-blur-xl">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-[0.34em] text-crown-gold">
                  About the Space
                </p>
                <h3 className="font-display text-3xl font-semibold text-crown-ink">
                  Intimate Private Space
                </h3>
              </div>

              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-5 w-5 text-crown-gold flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="font-medium text-crown-espresso">Cozy Atmosphere</p>
                    <p className="text-crown-espresso/90">
                      Warm lighting, comfortable seating, and elegant decor create the
                      perfect backdrop for your special occasion.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Users className="h-5 w-5 text-crown-gold flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="font-medium text-crown-espresso">Intimate Capacity</p>
                    <p className="text-crown-espresso/90">
                      Ideal for small gatherings of up to 20 guests for seated events or
                      up to 30 for cocktail-style receptions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CalendarDays className="h-5 w-5 text-crown-gold flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="font-medium text-crown-espresso">Flexible Timing</p>
                    <p className="text-crown-espresso/90">
                      Available daily from 9:00 AM to 7:00 PM. Maximum booking duration
                      is {MAX_HOURS} hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-crown-gold flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="font-medium text-crown-espresso">Prime Location</p>
                    <p className="text-crown-espresso/90">
                      Situated on Cunningham Road in the heart of Vasanth Nagar,
                      Bengaluru - easily accessible with ample parking nearby.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rental Uses */}
              <div className="mt-6">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.34em] text-crown-gold">
                  Perfect For
                </p>
                <div className="flex flex-wrap gap-3">
                  {rentalUses.map((use, index) => (
                    <span
                      key={use}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur-xl"
                    >
                      {use === "Photoshoots" ? <Camera className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                      {use}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}