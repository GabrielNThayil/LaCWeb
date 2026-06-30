"use client";

import Image from "next/image";
import { useState } from "react";

type ImageSource = "local" | "unsplash" | "placeholder";

interface MenuItemImageProps {
  src: string | null;
  alt: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Smart image component: prefers local > unsplash > themed SVG placeholder.
 * Shows a subtle animated shimmer overlay while loading.
 */
export default function MenuItemImage({
  src,
  alt,
  priority = false,
  fill = false,
  width,
  height,
  sizes,
  className = "",
  style,
}: MenuItemImageProps) {
  const [source, setSource] = useState<ImageSource>(
    src ? (src.startsWith("/") ? "local" : "unsplash") : "placeholder"
  );
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  function handleLoad() {
    setLoaded(true);
  }

  function handleError() {
    if (!failed) {
      setFailed(true);
      if (source === "unsplash") {
        setSource("placeholder");
      }
    }
  }

  const shimmer = !loaded && source !== "placeholder";

  if (source === "placeholder" || !src) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-crown-cream ${className}`}
        style={style}
      >
        {/* Themed placeholder with crown motif */}
        <PlaceholderAlt alt={alt} />
        {shimmer && <ShimmerOverlay />}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <Image
        src={source === "local" ? src : src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={PLACEHOLDER_BLUR}
        onLoad={handleLoad}
        onError={handleError}
        className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      {shimmer && <ShimmerOverlay />}
    </div>
  );
}

function PlaceholderAlt({ alt }: { alt: string }) {
  // Color chosen from the crown theme palette
  const color = "#61481C";
  const initials = alt
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-crown-paper">
      {/* Subtle grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={color} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Crown motif */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-25 mb-2"
      >
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7z" />
        <path d="M5 20h14" />
        <path d="M9 16l1.5 1.5L12 16l1.5 1.5L15 16" />
      </svg>

      {/* Item initials */}
      <span className="relative font-display text-lg font-semibold text-crown-espresso/20 uppercase tracking-widest">
        {initials}
      </span>

      {/* Small label */}
      <span className="relative mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-crown-espresso/15">
        No photo yet
      </span>
    </div>
  );
}

function ShimmerOverlay() {
  return (
    <div
      className="absolute inset-0 animate-pulse bg-gradient-to-r from-crown-paper/0 via-crown-gold/10 to-crown-paper/0"
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

// Tiny warm-cream blur for placeholder="blur" on real images
const PLACEHOLDER_BLUR =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#FFF8EC"/></svg>`
  ).replace(/\n/g, "");