# WonderMedia — AI-Powered Social Media Management Platform

**A production-quality, AI-driven platform for managing social media content, product catalogs, inventory tracking, and sales — with built-in image generation and an intelligent chatbot assistant.**

[Live Demo](https://wondermedia.vercel.app)

---

## Features

### AI Content Studio
- **AI Post Generation** — Generate captions, hashtags, and content ideas via OpenRouter (multiple free models: MiniMax, GLM, Nemotron, Gemma)
- **AI Image Generation** — NVIDIA FLUX models (Klein 4B, Schnell, Dev) generate product images from text prompts
- **AI Chatbot Assistant** — In-app conversational AI for marketing advice, product suggestions, and content help
- **Multi-Platform Posts** — Create and manage posts for Instagram, Facebook, LinkedIn, X, TikTok, Pinterest
- **Post Scheduling** — Calendar view with drag-and-drop scheduling
- **Combo Offers** — Create bundled product promotions with AI-generated concepts

### Product & Inventory Management
- **Product Catalog** — Full CRUD with images, variants, pricing, categories, SKU tracking
- **Bulk Import** — Upload products via CSV/Excel/ZIP
- **Image Upload** — Cloudinary-powered image management
- **Emoji & Visual Tags** — Quick product identification

### Tracker Module (Sales & Inventory)
- **Real-Time Dashboard** — Revenue, profit, stock levels with interactive charts (recharts)
- **Sales Recording** — Track individual sales with customer names and notes
- **Stock Management** — Add stock, adjust inventory, reorder alerts
- **Multi-Currency Support** — 7 currencies (USD, EUR, GBP, INR, JPY, AUD, CAD) with user-editable FX rates
- **Display Currency** — Convert all dashboard metrics to your preferred currency
- **Catalog Onboarding** — Two-step flow: track catalog products, then add stock
- **Inline Editing** — Edit thresholds, reorder quantities, and suppliers directly in the table
- **Transaction History** — Filterable by date range with CSV export
- **Customer Analytics** — Top customers, repeat rates, average order value
- **Profit Margins** — Per-product margin tracking with visual indicators

### Dashboard & Analytics
- **Unified Dashboard** — Posts, products, tracker metrics at a glance
- **Date Range Filtering** — Filter all metrics by custom date ranges
- **Revenue Charts** — Bar charts for revenue, profit, cost comparison
- **Platform Stats** — Reach and engagement by social platform
- **Activity Feed** — Recent actions and system events

### Security & Auth
- **JWT Authentication** — Short-lived access tokens + refresh tokens
- **Rate Limiting** — Configurable request throttling
- **Helmet** — HTTP security headers
- **Input Validation** — Global `ValidationPipe` with whitelist + class-validator
- **CORS** — Configured for production and development origins

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | React framework (App Router) |
| React | 19 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| TanStack Query | 5.x | Server state management |
| Zustand | - | Client state management |
| Recharts | 3.10 | Data visualization |
| Sonner | - | Toast notifications |
| Lucide React | - | Icons |
| Axios | - | HTTP client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11 | Node.js framework |
| Prisma | 7 | ORM (with `PrismaPg` adapter) |
| PostgreSQL | - | Primary database |
| Redis | - | Caching + rate limiting |
| class-validator | - | DTO validation |
| JWT | - | Authentication |

### AI & Media
| Service | Purpose |
|---------|---------|
| NVIDIA FLUX | Image generation (Klein 4B, Schnell, Dev) |
| OpenRouter | Text generation (7+ free models) |
| Cloudinary | Image upload, storage, optimization |

### Deployment
| Platform | Service |
|----------|---------|
| Vercel | Frontend hosting |
| Render | Backend hosting (auto-deploy from `main`) |
| GitHub | Source control + CI/CD |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis instance
- NVIDIA API key ([build.nvidia.com](https://build.nvidia.com))
- OpenRouter API key ([openrouter.ai](https://openrouter.ai))
- Cloudinary account ([cloudinary.com](https://cloudinary.com))

### Installation

```bash
git clone https://github.com/justforstories1998-eng/social-media-manager.git
cd social-media-manager
```

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # Fill in environment variables
npx prisma generate
npx prisma db push
npm run start:dev      # Starts on port 3001
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env   # Set NEXT_PUBLIC_API_URL
npm run dev            # Starts on port 3002
```

### Environment Variables

**Backend** (`backend/.env`):
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# AI — OpenRouter (text generation)
OPENROUTER_API_KEY=sk-or-...

# AI — NVIDIA (image generation)
NVIDIA_API_KEY=nvapi-...
NVIDIA_MODEL=black-forest-labs/flux.2-klein-4b

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# CORS
FRONTEND_URL=http://localhost:3002
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Project Structure

```
Social_Media_Manager/
├── frontend/                    # Next.js 16 App
│   ├── app/
│   │   ├── (authenticated)/     # Protected routes
│   │   │   ├── ai/studio/       # AI Image Generation
│   │   │   ├── calendar/        # Post scheduling
│   │   │   ├── chatbot/         # AI chatbot
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── products/        # Product management
│   │   │   ├── tracker/         # Sales & inventory tracker
│   │   │   └── tracker/[id]/    # Product detail view
│   │   └── auth/                # Login/register
│   ├── components/              # Reusable UI components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # API client, utilities
│   └── stores/                  # Zustand state stores
│
├── backend/                     # NestJS 11 API
│   ├── src/
│   │   ├── ai/                  # AI text + image generation
│   │   ├── auth/                # JWT auth, guards, strategies
│   │   ├── tracker/             # Sales, stock, analytics, FX rates
│   │   ├── products/            # Product CRUD
│   │   ├── users/               # User management
│   │   ├── posts/               # Social media posts
│   │   ├── calendar/            # Scheduling
│   │   ├── common/              # Filters, guards, interceptors
│   │   └── main.ts              # App bootstrap
│   └── prisma/
│       └── schema.prisma        # Database schema
│
└── docs/                        # Design specs, implementation plans
```

---

## API Overview

All routes are prefixed with `/api`.

| Group | Endpoints | Description |
|-------|-----------|-------------|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh` | Registration, login, token refresh |
| Users | `GET /users/me`, `PUT /users/me` | Profile + display currency preference |
| Products | `GET/POST /products`, `PUT/DELETE /products/:id` | Product CRUD |
| Tracker | `GET /tracker`, `GET /tracker/dashboard` | Product list + dashboard metrics |
| Tracker Sync | `POST /tracker/sync`, `POST /tracker/sync/single` | Sync products to tracker |
| Tracker Sales | `POST /tracker/sale`, `GET /tracker/:id/sales` | Record and list sales |
| Tracker Stock | `POST /tracker/stock`, `POST /tracker/adjust` | Add/adjust inventory |
| FX Rates | `GET /tracker/fx-rates`, `PUT /tracker/fx-rates` | Get/update currency conversion rates |
| Tracker Export | `GET /tracker/export/csv`, `GET /tracker/transactions/all` | CSV export, transaction history |
| AI Text | `POST /ai/generate`, `POST /ai/chat` | Content generation, chatbot |
| AI Image | `POST /ai/generate-image`, `POST /ai/trace-generate` | NVIDIA FLUX image generation |
| Posts | `GET/POST /posts`, `PUT/DELETE /posts/:id` | Post management |
| Calendar | `GET /calendar/events` | Scheduled content |

---

## Testing

```bash
# Backend — run all tests
cd backend && npx jest

# Backend — run specific test suites
npx jest src/tracker    # Tracker + FX rate tests
npx jest src/users      # User preference tests

# Frontend — type checking
cd frontend && npx tsc --noEmit
```

---

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import repo in Vercel
3. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
4. Deploy — auto-deploys on push to `main`

### Backend (Render)
1. Create a Web Service on Render
2. Connect GitHub repo
3. Set all environment variables
4. Build command: `cd backend && npm install && npx prisma generate`
5. Start command: `cd backend && node dist/main.js`
6. Auto-deploys on push to `main`

---

## License

MIT License — free to use, modify, and distribute.

---

**Built with Next.js 16, NestJS 11, Prisma 7, NVIDIA FLUX, and OpenRouter.**
