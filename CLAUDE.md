# 🧠 Project Configuration Guide

## 📁 File Structure
```
src/
├── components/         # UI components
│   └── MoodRecommender.tsx
├── lib/                # Shared utilities
├── pages/              # Page components
├── public/             # Static assets
├── styles/             # CSS configurations
│   ├── globals.css      # Base styles
│   ├── animations.css   # Animation states
│   └── cursors.css     # Custom cursor styles
├── tailwind.config.ts    # Tailwind configuration
└── next.config.mjs      # Next.js configuration
```

## 🎨 Design System
- **Typography**: Interfont (imported in globals.css)
- **Color Palette**: Crown-themed neutrals with espresso accents
- **Spacing**: 8px base grid system
- **Animations**: Subtle transitions (0.3s-0.5s duration)

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

## 🚀 Next Steps
1. Finalize recommendation algorithm with advanced filtering
2. Implement mock API for realistic menu data
3. Add accessibility features (ARIA labels, keyboard nav)
4. Set up CI/CD pipeline
5. Implement state management for preferences

## 🧪 Accessibility Progress
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation support
- [ ] Screen reader optimization
- [ ] Contrast ratio verification

## 📦 Dependencies
- next-auth: Authentication state
- framer-motion: Animation library
- tailwindcss: Utility-first styling
- lucide-react: Icon system
``