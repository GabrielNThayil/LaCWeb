/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: [
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Prevent clickjacking — block iframe embedding
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // XSS protection (legacy browsers)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer policy — don't leak referrer to external sites
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Force HTTPS (if deployed over HTTPS — Vercel auto-handles this)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Content Security Policy — restrict sources
          // Allow: same origin, inline styles/scripts (needed for Next.js), Google Fonts
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Script: 'self' + necessary Next.js internals + razorpay checkout
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
              // Styles: 'self' + inline (Tailwind/globals.css)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Images: 'self' + data URIs + Google Fonts + Unsplash
              "img-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com https://images.unsplash.com https://*.vercel.app",
              // Fonts: Google Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Connect: self + Google Fonts API
              "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://api.razorpay.com",
              // Frame: block embedding (already set by X-Frame-Options)
              "frame-src 'none'",
              // Object/plugins: block
              "object-src 'none'",
              // Base URI: restrict to self
              "base-uri 'self'",
              // Form action: self
              "form-action 'self'",
            ].join("; "),
          },
          // Permissions Policy — disable risky browser features
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=(self)",
              "payment=()",
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;