# User Onboarding Tour System — Design Spec

## Overview

A reusable, interactive onboarding tour system for WonderMedia. Two independent tour layers: a global first-login tour introducing the application, and per-module tours for detailed guidance. Tour state stored in localStorage (per-browser).

## Architecture

### File Structure
```
frontend/
├── components/
│   └── tour/
│       ├── TourProvider.tsx      # React Context + state management
│       ├── TourSpotlight.tsx     # Overlay, spotlight cutout, tooltip
│       └── TourButton.tsx        # "Tour" button for module headers
├── lib/
│   └── tourConfigs.ts            # Step definitions per module
├── hooks/
│   └── useTour.ts                # Convenience hook
```

### State Shape (localStorage key: `wondermedia_tour_state`)
```typescript
{
  global: { completed: boolean, skipped: boolean },
  modules: {
    dashboard: { completed: boolean, skipped: boolean },
    posts: { completed: boolean, skipped: boolean },
    products: { completed: boolean, skipped: boolean },
    calendar: { completed: boolean, skipped: boolean },
    aiImage: { completed: boolean, skipped: boolean },
    aiVideo: { completed: boolean, skipped: boolean },
  }
}
```

### Integration Points
- `TourProvider` wraps children in `frontend/app/(authenticated)/layout.tsx`, inside `AuthGuard`
- `data-tour="element-name"` attributes added to existing DOM elements in each module page
- TourButton added to each module page header (top-right)
- Global tour auto-starts on first login (localStorage check)

## Components

### TourProvider (React Context)
- Provides: `startTour(moduleId)`, `stopTour()`, `nextStep()`, `prevStep()`, `skipTour()`, `finishTour()`, `isTourActive`, `currentModule`, `currentStep`, `totalSteps`
- On mount: reads localStorage, checks if global tour needed
- Exposes `shouldStartGlobalTour()` for the AuthGuard/layout to call

### TourSpotlight
- Full-screen overlay: `bg-black/60` with `pointer-events-none` on overlay, `pointer-events-auto` on tooltip
- Spotlight cutout: CSS `clip-path: polygon(...)` calculated from target element's `getBoundingClientRect()`
- Tooltip: `glass`-styled card, auto-positioned (flip logic based on element position)
- Keyboard: Escape=skip, ArrowRight=next, ArrowLeft=back, Enter=next/finish
- Scroll: auto-scrolls target into view with `scrollIntoView({ behavior: 'smooth', block: 'center' })`
- Resize/scroll listener: repositions spotlight in real-time
- Animation: Framer Motion for tooltip enter/exit, spotlight fade

### TourButton
- Fixed in top-right of each module page header
- Icon: `Sparkles` from lucide-react + "Tour" text
- onClick: calls `startTour(moduleId)` from context
- Always visible, regardless of tour completion state

## Tour Configurations

### Global Tour (6 steps, auto-starts)
| # | Target | Title | Description |
|---|--------|-------|-------------|
| 1 | `sidebar` | Welcome to WonderMedia | Your AI-powered social media command center. |
| 2 | `nav-dashboard` | Dashboard | Home base. Performance at a glance. |
| 3 | `nav-posts` | Posts | Create, edit, schedule content. AI helps write captions. |
| 4 | `nav-products` | Products | Product catalog. AI uses this for better content. |
| 5 | `nav-ai` | AI Studio | Generate images, videos, content ideas. Combo offers. |
| 6 | `nav-calendar` | Calendar | Visualize schedule. Content gaps. AI recommendations. |

### Dashboard Tour (4 steps)
1. `stats` — Key metrics overview
2. `recent-posts` — Recent posts feed
3. `quick-actions` — Quick action buttons
4. `performance` — Performance chart

### Posts Tour (5 steps)
1. `create-post` — Create new post
2. `post-filters` — Filter by status/platform
3. `post-card` — Post card actions
4. `post-schedule` — Schedule posts
5. `ai-assist` — AI content generation

### Products Tour (4 steps)
1. `add-product` — Add new product
2. `product-card` — Product info and images
3. `product-actions` — Content actions
4. `combo-offer` — Multi-product combo offers

### Calendar Tour (4 steps)
1. `calendar-grid` — Monthly view with post indicators
2. `content-gaps` — Content gap detection
3. `daily-recommendations` — AI recommendations per day
4. `create-for-date` — Create post for specific date

### AI Image Tour (4 steps)
1. `product-selector` — Select product for context
2. `prompt-input` — AI-generated or custom prompt
3. `style-options` — Visual style and settings
4. `result-actions` — Download, attach to post, view source

### AI Video Tour (4 steps)
1. `video-product` — Select product
2. `video-prompt` — Video prompt
3. `video-settings` — Duration and model
4. `video-result` — Result and actions

## UX Requirements

- Spotlight glow around target element (subtle purple border/shadow)
- Tooltip auto-positions to avoid off-screen
- Smooth scroll to off-screen elements
- Keyboard navigation (Escape, arrows, Enter)
- Step counter "2 of 6" in tooltip header
- Back (ghost), Skip Tour (text link), Next/Finish (neon-button)
- On skip: close immediately, save skipped state
- On finish: save completed state
- Tour button always available to restart any module tour
- Responsive: works on desktop, tablet, mobile

## Adding New Tours

Add entry to `tourConfigs.ts`:
```typescript
{
  module: 'newModule',
  steps: [{ target: 'data-tour="feature"', title: '...', description: '...' }]
}
```
Add `data-tour="feature"` to DOM element. No other code changes needed.
