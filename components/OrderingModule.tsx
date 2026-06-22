"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  CreditCard,
  LocateFixed,
  Loader2,
  MapPinned,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  Truck
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  calculateOrderTotal,
  deliveryFee,
  formatCurrency,
  freeDeliveryThreshold,
  orderMenu,
  type OrderCategory
} from "../lib/order-catalog";
import { getUserPreferences, updateUserPreferences } from "@/lib/storage";
import { PLACEHOLDERS } from "@/lib/blurs";

type Fulfillment = "delivery" | "pickup";
type CheckoutStatus = "idle" | "creating" | "paying" | "success" | "error";
type Filter = "All" | OrderCategory;
type DeliveryQuote = {
  configured: boolean;
  provider: string;
  fee?: number;
  message?: string;
};

type PaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayConstructor = new (options: {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; contact: string; email?: string };
  notes: Record<string, string>;
  theme: { color: string };
  handler: (payment: PaymentResponse) => Promise<void>;
  modal: { ondismiss: () => void };
}) => { open: () => void };

const filters: Filter[] = ["All", "Coffee", "Desserts", "Brunch", "Drinks"];
const scheduleOptions = [
  "ASAP",
  "Today, 12:30 PM",
  "Today, 2:00 PM",
  "Today, 5:30 PM",
  "Today, 7:30 PM"
];
const storageKey = "la-couronne-cart";

export default function OrderingModule() {
  const [filter, setFilter] = useState<Filter>("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [timing, setTiming] = useState(scheduleOptions[0]);
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [message, setMessage] = useState("");
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const { data: session } = useSession();
  const [confirmation, setConfirmation] = useState<{
    id: string;
    eta: string;
    stages: string[];
    delivery?: {
      provider: string;
      automated: boolean;
      trackingUrl?: string | null;
      message: string;
    };
  } | null>(null);

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = window.localStorage.getItem(storageKey);
    let loadedCart: Record<string, number> = {};

    if (storedCart) {
      try {
        loadedCart = JSON.parse(storedCart);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    // Check for mood-based order from AI recommender
    const moodOrder = sessionStorage.getItem('moodOrder');
    if (moodOrder) {
      try {
        const orderItems = JSON.parse(moodOrder);
        // Add each item to cart (match by name)
        orderItems.forEach((item: { name: string; price: number }) => {
          const menuItem = orderMenu.find(m => m.name === item.name);
          if (menuItem) {
            loadedCart[menuItem.id] = (loadedCart[menuItem.id] || 0) + 1;
          }
        });
        // Clear sessionStorage after loading
        sessionStorage.removeItem('moodOrder');
      } catch {
        sessionStorage.removeItem('moodOrder');
      }
    }

    setCart(loadedCart);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart]);

  const visibleItems = useMemo(
    () =>
      filter === "All"
        ? orderMenu
        : orderMenu.filter((item) => item.category === filter),
    [filter]
  );

  const cartItems = useMemo(
    () =>
      orderMenu
        .filter((item) => cart[item.id])
        .map((item) => ({ ...item, quantity: cart[item.id] })),
    [cart]
  );

  const totals = useMemo(() => {
    if (cartItems.length === 0) {
      return { lines: [], subtotal: 0, packaging: 0, delivery: 0, total: 0 };
    }
    return calculateOrderTotal(
      cartItems.map((item) => ({ id: item.id, quantity: item.quantity })),
      fulfillment,
      deliveryQuote?.configured ? deliveryQuote.fee : undefined
    );
  }, [cartItems, fulfillment, deliveryQuote]);

  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const isLoading = status === "creating" || status === "paying";

  const addItem = (id: string) => {
    setCart((current) => ({ ...current, [id]: Math.min((current[id] || 0) + 1, 12) }));
    setMessage("");
    if (status !== "success") {
      setStatus("idle");
    }
  };

  const removeItem = (id: string) => {
    setCart((current) => {
      const nextQuantity = (current[id] || 0) - 1;
      if (nextQuantity <= 0) {
        const { [id]: removed, ...rest } = current;
        void removed;
        return rest;
      }
      return { ...current, [id]: nextQuantity };
    });
  };

  const clearCart = () => {
    setCart({});
    setStatus("idle");
    setMessage("");
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("Location sharing is not available in this browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setDeliveryQuote(null);
        setStatus("idle");
        setMessage("Location pin added. Check delivery availability next.");
        setIsLocating(false);
      },
      () => {
        setStatus("error");
        setMessage("Location was not shared. Borzo delivery needs a drop pin.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const checkDeliveryQuote = async () => {
    if (!name || !phone || !address) {
      setStatus("error");
      setMessage("Enter your name, phone number, and delivery address first.");
      return;
    }
    if (!coordinates) {
      setStatus("error");
      setMessage("Add your delivery location pin before checking Borzo availability.");
      return;
    }

    setIsQuoting(true);
    setMessage("Checking delivery availability...");
    try {
      const response = await fetch("/api/delivery/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, landmark, coordinates })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Delivery is not available to this address.");
      }
      setDeliveryQuote(result);
      setStatus("idle");
      setMessage(
        result.configured
          ? `Delivery available. Live courier quote: ${formatCurrency(result.fee)}.`
          : result.message
      );
    } catch (error) {
      setDeliveryQuote(null);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to check delivery.");
    } finally {
      setIsQuoting(false);
    }
  };

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartItems.length) {
      setStatus("error");
      setMessage("Choose at least one cafe item before checkout.");
      return;
    }

    const Razorpay = (
      window as Window & { Razorpay?: RazorpayConstructor }
    ).Razorpay;

    if (!Razorpay) {
      setStatus("error");
      setMessage("Secure checkout is loading. Please try again in a moment.");
      return;
    }

    setStatus("creating");
    setMessage("Confirming your order total securely...");

    try {
      const response = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({ id: item.id, quantity: item.quantity })),
          fulfillment,
          timing,
          customer: { name, phone, email, address, landmark, coordinates },
          instructions
        })
      });
      const order = await response.json();
      if (!response.ok) {
        throw new Error(order.error || "Unable to place this order.");
      }

      setStatus("paying");
      setMessage("Opening secure Razorpay payment...");

      new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: "La Couronne Cafe",
        description: `${fulfillment === "delivery" ? "Delivery" : "Pickup"} order`,
        order_id: order.orderId,
        prefill: { name, contact: phone, email },
        notes: {
          fulfillment,
          timing
        },
        theme: { color: "#61481C" },
        handler: async (payment) => {
          const verifyResponse = await fetch("/api/shop/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payment,
              fulfillment,
              dispatchPayload: order.dispatchPayload,
              dispatchToken: order.dispatchToken
            })
          });
          const result = await verifyResponse.json();
          if (!verifyResponse.ok) {
            setStatus("error");
            setMessage(result.error || "Payment could not be verified.");
            return;
          }

          setConfirmation({
            id: result.confirmationId,
            eta: result.eta,
            stages: result.stages,
            delivery: result.delivery
          });
          setStatus("success");
          setMessage("Payment successful. Your order is confirmed.");

          // Update user's taste preferences based on the order
          if (session) {
            const userId = session.user.id;
            const currentPrefs = getUserPreferences(userId);

            // Extract ordered items
            const orderedItems = cartItems.map(item => item.name);

            // Update favorite drinks and foods based on order
            const updatedPrefs = {
              ...currentPrefs,
              favoriteDrinks: Array.from(new Set([...currentPrefs.favoriteDrinks.concat(
                orderedItems.filter(item =>
                  item.toLowerCase().includes('latte') ||
                  item.toLowerCase().includes('mocha') ||
                  item.toLowerCase().includes('elixir') ||
                  item.toLowerCase().includes('matcha')
                )
              )])).slice(0, 3), // Keep top 3
              favoriteFoods: Array.from(new Set([...currentPrefs.favoriteFoods.concat(
                orderedItems.filter(item =>
                  item.toLowerCase().includes('croissant') ||
                  item.toLowerCase().includes('sandwich') ||
                  item.toLowerCase().includes('tub') ||
                  item.toLowerCase().includes('cheesecake')
                )
              )])).slice(0, 3), // Keep top 3
              // Update flavor preferences based on ordered items
              flavorPreferences: [...new Set([...currentPrefs.flavorPreferences.concat(
                orderedItems.flatMap(item => {
                  const flavors = [];
                  const itemLower = item.toLowerCase();
                  if (itemLower.includes('rose') || itemLower.includes('white rose')) flavors.push('Rose');
                  if (itemLower.includes('pistachio')) flavors.push('Pistachio');
                  if (itemLower.includes('white chocolate') || itemLower.includes('white rose')) flavors.push('White Chocolate');
                  if (itemLower.includes('hazelnut')) flavors.push('Hazelnut');
                  return flavors;
                })
              )])].slice(0, 3) // Keep top 3
            };

            updateUserPreferences(userId, updatedPrefs);
          }

          setCart({});
        },
        modal: {
          ondismiss: () => {
            setStatus("idle");
            setMessage("Payment cancelled. Your cart is still saved.");
          }
        }
      }).open();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Ordering failed.");
    }
  };

  return (
    <section id="order" className="relative overflow-hidden bg-crown-cream px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-11 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.34em] text-crown-gold">
              Order Direct
            </p>
            <h2 className="font-display text-5xl font-semibold leading-tight sm:text-7xl">
              Curate your cafe delivery.
            </h2>
            <p className="mt-5 text-lg leading-8 text-crown-espresso/90">
              Place a secure pickup or delivery order from our signature cafe edit.
              Free delivery above {formatCurrency(freeDeliveryThreshold)}.
            </p>
          </div>
          <a
            href="#checkout"
            className="inline-flex items-center gap-3 rounded-full bg-crown-espresso px-6 py-4 font-semibold text-crown-paper shadow-gold transition duration-300 hover:-translate-y-1 hover:bg-crown-caramel"
          >
            <ShoppingBag className="h-5 w-5" />
            Cart {itemCount > 0 ? `(${itemCount})` : ""}
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-7 lg:grid-cols-[1.12fr_.88fr]">
          <div>
            <div className="mb-6 flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-full border px-5 py-3 text-sm font-semibold transition duration-300 ${
                    filter === item
                      ? "border-crown-espresso bg-crown-espresso text-crown-paper"
                      : "border-crown-espresso/20 bg-white/86 text-crown-espresso hover:border-crown-espresso/40 hover:bg-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <motion.div layout className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {visibleItems.map((item) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    key={item.id}
                    className="group flex min-h-[174px] overflow-hidden rounded-[1.3rem] border border-crown-espresso/18 bg-white/92 shadow-[0_12px_38px_rgba(97,72,28,.10)]"
                  >
                    <div className="relative w-[39%] shrink-0 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        placeholder="blur"
                        blurDataURL={PLACEHOLDERS.paper}
                        sizes="(max-width: 640px) 40vw, 22vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      {item.badge && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-crown-gold">
                          {item.badge}
                        </p>
                      )}
                      <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">
                        {item.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-crown-espresso/82">
                        {item.description}
                      </p>
                      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                        <span className="text-sm font-bold text-crown-espresso">
                          {formatCurrency(item.price)}
                        </span>
                        {cart[item.id] ? (
                          <div className="flex items-center gap-2 rounded-full bg-crown-espresso p-1 text-crown-paper">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove one ${item.name}`}
                              className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-white/15"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-4 text-center text-sm font-semibold">
                              {cart[item.id]}
                            </span>
                            <button
                              type="button"
                              onClick={() => addItem(item.id)}
                              aria-label={`Add one ${item.name}`}
                              className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-white/15"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addItem(item.id)}
                            className="grid h-9 w-9 place-items-center rounded-full bg-crown-espresso text-crown-paper transition duration-300 hover:scale-105 hover:bg-crown-caramel"
                            aria-label={`Add ${item.name} to cart`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          <div id="checkout" className="lg:sticky lg:top-24 lg:self-start">
            <AnimatePresence mode="wait">
              {status === "success" && confirmation ? (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2rem] border border-crown-espresso/22 bg-white/96 p-6 shadow-glow sm:p-8"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-crown-espresso text-crown-honey">
                    <Check className="h-6 w-6" />
                  </span>
                  <p className="mt-6 text-sm font-bold uppercase tracking-[0.28em] text-crown-gold">
                    Order Confirmed
                  </p>
                  <h3 className="mt-3 font-display text-4xl font-semibold">
                    Thank you, {name}.
                  </h3>
                  <p className="mt-4 text-crown-espresso/88">
                    Confirmation <strong>{confirmation.id}</strong> | Estimated{" "}
                    {fulfillment === "delivery" ? "delivery" : "pickup readiness"} in{" "}
                    {confirmation.eta}.
                  </p>
                  {confirmation.delivery && (
                    <div className="mt-5 rounded-2xl border border-crown-espresso/18 bg-white p-4 text-sm text-crown-espresso/86">
                      <p className="font-semibold text-crown-espresso">
                        Delivery fulfilment
                      </p>
                      <p className="mt-1">{confirmation.delivery.message}</p>
                      {confirmation.delivery.trackingUrl && (
                        <a
                          href={confirmation.delivery.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 font-semibold text-crown-caramel"
                        >
                          Track courier <ArrowRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                  <div className="mt-7 space-y-3">
                    {confirmation.stages.map((stage, index) => (
                      <div
                        key={stage}
                        className={`flex items-center gap-4 rounded-2xl border p-4 ${
                          index === 0
                            ? "border-crown-gold/30 bg-white text-crown-espresso"
                            : "border-crown-gold/12 text-crown-espresso/45"
                        }`}
                      >
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-full ${
                            index === 0
                              ? "bg-crown-espresso text-crown-paper"
                              : "bg-crown-gold/12"
                          }`}
                        >
                          {index === 0 ? <Check className="h-4 w-4" /> : index + 1}
                        </span>
                        <span className="font-semibold">{stage}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmation(null);
                      setStatus("idle");
                      setMessage("");
                    }}
                    className="mt-7 inline-flex items-center gap-2 rounded-full border border-crown-gold/25 px-5 py-3 font-semibold text-crown-espresso transition hover:bg-white"
                  >
                    Start another order <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="checkout"
                  onSubmit={handleCheckout}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2rem] border border-crown-espresso/22 bg-white/96 p-5 shadow-glow sm:p-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.26em] text-crown-gold">
                        Your order
                      </p>
                      <h3 className="mt-2 font-display text-4xl font-semibold">
                        Cart
                      </h3>
                    </div>
                    {cartItems.length > 0 && (
                      <button
                        type="button"
                        onClick={clearCart}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-crown-espresso/78 transition hover:text-crown-espresso"
                      >
                        <Trash2 className="h-4 w-4" /> Clear
                      </button>
                    )}
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="my-7 rounded-3xl border border-dashed border-crown-espresso/35 bg-crown-paper/70 px-5 py-9 text-center">
                      <Coffee className="mx-auto h-7 w-7 text-crown-gold" />
                      <p className="mt-4 font-semibold text-crown-espresso">
                        Your tray is waiting.
                      </p>
                      <p className="mt-2 text-sm text-crown-espresso/78">
                        Add coffee, pastries, or brunch to begin.
                      </p>
                    </div>
                  ) : (
                    <div className="my-6 max-h-52 space-y-3 overflow-y-auto pr-1">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-crown-espresso/10 bg-crown-paper/78 p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{item.name}</p>
                            <p className="text-xs text-crown-espresso/76">
                              {formatCurrency(item.price)} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`} className="cart-stepper">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-4 text-center text-sm font-bold">{item.quantity}</span>
                            <button type="button" onClick={() => addItem(item.id)} aria-label={`Add ${item.name}`} className="cart-stepper">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 rounded-full border border-crown-espresso/10 bg-crown-paper/85 p-1.5">
                    {(["delivery", "pickup"] as Fulfillment[]).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFulfillment(method)}
                        className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold capitalize transition ${
                          fulfillment === method
                            ? "bg-crown-espresso text-crown-paper"
                            : "text-crown-espresso/82"
                        }`}
                      >
                        {method === "delivery" ? (
                          <Truck className="h-4 w-4" />
                        ) : (
                          <Package className="h-4 w-4" />
                        )}
                        {method}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <label className="field-label">
                      Name
                      <input required className="field-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                    </label>
                    <label className="field-label">
                      Phone
                      <input required className="field-input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Mobile number" />
                    </label>
                    <label className="field-label sm:col-span-2">
                      Email for receipt
                      <input type="email" className="field-input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Optional" />
                    </label>
                    {fulfillment === "delivery" && (
                      <>
                        <label className="field-label sm:col-span-2">
                          Delivery address
                          <textarea required className="field-input min-h-[76px] resize-none" value={address} onChange={(event) => { setAddress(event.target.value); setDeliveryQuote(null); }} placeholder="House or office, street and area" />
                        </label>
                        <label className="field-label sm:col-span-2">
                          Landmark
                          <input className="field-input" value={landmark} onChange={(event) => { setLandmark(event.target.value); setDeliveryQuote(null); }} placeholder="Optional landmark" />
                        </label>
                        <button
                          type="button"
                          onClick={captureLocation}
                          disabled={isLocating}
                          className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full border border-crown-espresso/28 bg-crown-paper/82 px-5 py-3 text-sm font-semibold text-crown-espresso transition hover:border-crown-espresso/50 hover:bg-white disabled:opacity-65"
                        >
                          {isLocating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LocateFixed className="h-4 w-4" />
                          )}
                          {coordinates ? "Update delivery pin" : "Share delivery pin"}
                        </button>
                        {coordinates && (
                          <p className="sm:col-span-2 text-center text-xs font-semibold text-crown-caramel">
                            Delivery pin added for Borzo serviceability.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={checkDeliveryQuote}
                          disabled={isQuoting}
                          className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full border border-crown-espresso/28 bg-crown-paper/82 px-5 py-3 text-sm font-semibold text-crown-espresso transition hover:border-crown-espresso/50 hover:bg-white disabled:opacity-65"
                        >
                          {isQuoting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Truck className="h-4 w-4" />
                          )}
                          Check Borzo availability
                        </button>
                      </>
                    )}
                    <label className="field-label sm:col-span-2">
                      {fulfillment === "delivery" ? "Delivery time" : "Pickup time"}
                      <select className="field-input" value={timing} onChange={(event) => setTiming(event.target.value)}>
                        {scheduleOptions.map((time) => (
                          <option key={time}>{time}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field-label sm:col-span-2">
                      Order notes
                      <input className="field-input" value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Allergies or preparation notes" />
                    </label>
                  </div>

                  <div className="mt-6 space-y-2 border-t border-crown-gold/20 pt-5 text-sm">
                    <PriceLine label="Subtotal" amount={totals.subtotal} />
                    <PriceLine label="Packaging" amount={totals.packaging} />
                    <PriceLine
                      label={
                        fulfillment === "pickup"
                          ? "Pickup"
                          : totals.delivery === 0 && totals.subtotal > 0
                            ? "Delivery (complimentary)"
                            : `Delivery fee`
                      }
                      amount={totals.delivery}
                    />
                    {fulfillment === "delivery" &&
                      totals.subtotal > 0 &&
                      totals.subtotal < freeDeliveryThreshold && (
                        <p className="pt-1 text-xs text-crown-espresso/76">
                          Add {formatCurrency(freeDeliveryThreshold - totals.subtotal)} more
                          for complimentary delivery. Standard delivery is {formatCurrency(deliveryFee)}.
                        </p>
                      )}
                    <div className="mt-4 flex items-center justify-between border-t border-crown-gold/18 pt-4 font-bold">
                      <span>Total payable</span>
                      <span className="font-display text-3xl">
                        {formatCurrency(totals.total)}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={isLoading || cartItems.length === 0}
                    type="submit"
                    className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-crown-espresso px-7 py-4 font-semibold text-crown-paper shadow-gold transition duration-300 hover:-translate-y-1 hover:bg-crown-caramel disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                    Pay securely and place order
                  </button>
                  <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-crown-espresso/76">
                    <Clock3 className="h-3.5 w-3.5" />
                    UPI, cards, wallets and net banking via Razorpay
                  </p>
                  {message && (
                    <div
                      className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                        status === "error"
                          ? "border-red-600/20 bg-red-50 text-red-800"
                          : "border-crown-gold/22 bg-white/70 text-crown-espresso"
                      }`}
                    >
                      {message}
                    </div>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
            <div className="mt-4 flex items-start gap-3 rounded-3xl border border-crown-espresso/16 bg-white/76 p-4 text-sm text-crown-espresso/84">
              <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-crown-gold" />
              Bengaluru delivery uses Borzo 2W fulfilment after secure payment. A location pin is required to confirm serviceability.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceLine({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between text-crown-espresso/84">
      <span>{label}</span>
      <span>{formatCurrency(amount)}</span>
    </div>
  );
}
