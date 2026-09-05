# 🧠 Project Configuration Guide

## 📁 File Structure
```
./
├── app/                  # App Router (Next.js 14)
│   ├── api/              # Route handlers (auth, razorpay, delivery, admin)
│   ├── auth/             # signin / signup / error pages
│   ├── accessibility/    # Accessibility statement
│   ├── contact/          # Contact page
│   ├── events-space-rental/
│   ├── privacy/, terms/  # Legal pages
│   ├── layout.tsx        # Root layout with SessionWrapper + CookieConsent
│   ├── page.tsx          # Home (mood-based experience)
│   └── session-provider.tsx
├── pages/                # Legacy Pages Router leftovers (do not add new routes here)
│   ├── admin/dashboard.tsx     # Admin order dashboard (protected by middleware)
│   └── api/menu.ts             # Reads data/menu.json, returns order-formatted response
├── components/           # Shared UI (MoodRecommender, OrderingModule, MenuItemImage, CookieConsent, Logo, MobileNav)
├── lib/                  # Utilities (rate-limit, delivery-token, borzo, order-store, order-utils, blurs, models, storage)
├── data/
│   └── menu.json         # Source of truth for the menu (122 items, 5 categories)
├── types/                # menuTypes.ts, next-auth.d.ts
├── styles/               # globals.css, animations.css, cursors.css
├── public/               # logo.png and other static assets
├── menu/                 # La_Couronne_Menu_Revised_SentenceCase.xlsx (import source)
├── events/               # Placeholder, currently empty
├── middleware.ts         # Auth gate on /admin/:path*
├── next.config.mjs       # security headers + CSP + images config
├── tailwind.config.ts    # Crown theme tokens
└── tsconfig.json         # "@/*" -> "./*" alias
```

> **Note**: The project uses the App Router for new routes. The `pages/` directory is intentional legacy
> for one admin page and a JSON API and should not be expanded. Tailwind's content scanner must include
> `./pages/**` so admin-page classes survive purge.

## 🎨 Design System
- **Typography**: Inter font (via `next/font` in app/layout), Display + Sans fallbacks configured in `next.config.mjs`
- **Color Palette**: Crown theme tokens (`espresso`, `caramel`, `gold`, `honey`, `cream`, `paper`, `ink`) in `tailwind.config.ts`
- **Spacing**: 8px base grid
- **Animations**: 0.2s–0.5s transitions; reduced-motion media query respected

## 🎞️ Animation States
1. **Entrance**: Slide-up with fade-in
2. **Interaction**: Hover growth (1.05x) with smooth transition
3. **Loading**: Progress cursor + vertical shift
4. **Recommendation Reveal**: Fade-in with vertical translation

## 🧩 Component States
- **Mood Cards**: Default → Hover → Selected
- **Recommendation**: Loading → Visible

## 📐 Responsive Design
- Mobile: Single-column grid
- Tablet: 2-column grid
- Desktop: 3-column grid

## 🚀 Next Steps (post-2026-08 audit)
1. `npm audit` baseline and CVE remediation
2. Dependency upgrades (Next 14 → 16, React 18 → 19, Tailwind 3 → 4) — staged
3. Replace in-memory `lib/rate-limit.ts` with Vercel KV on Pro plan (currently per-instance only)
4. Verify CSP under upgraded Next (Next 16 may require tweaks for `unsafe-eval`)
5. Add a CI workflow (lint + type-check + build)

## 🧪 Accessibility Progress
- [ ] ARIA labels for interactive elements (audit needed — partly in place via icon-only buttons)
- [ ] Keyboard navigation support (audit needed)
- [ ] Screen reader optimization (audit needed)
- [ ] Contrast ratio verification (audit needed — auto-test has not been run)
- [x] `prefers-reduced-motion` honored

## 📦 Dependencies
- next-auth: Authentication state
- framer-motion: Animation library
- tailwindcss: Utility-first styling
- lucide-react: Icon system
``