# Aether • AI-Powered Social Media Management Platform

**The completely free, open-source, self-hosted, enterprise-grade AI Social Media Management Platform**

Built 100% on open-source technologies — no paid APIs, no vendor lock-in, minimal hardware usage.

## ✨ Features

- **Completely Free** — Runs entirely on self-hosted open source tools (Ollama, Stable Diffusion via ComfyUI / Automatic1111, Redis, PostgreSQL)
- **AI Content Generation** — Local LLMs (Llama 3.2, Qwen, Gemma, Mistral) for captions, hashtags, ideas
- **AI Image Generation** — Local Stable Diffusion / FLUX
- **Daily AI Planner** — Automatically detects holidays, festivals, awareness days and generates relevant content
- **1–2 Posts per Day** — Intelligent scheduling to reduce compute usage
- **Telegram Approval Flow** — Review and approve content via Telegram
- **Multi-Platform Publishing** — Instagram, Facebook, LinkedIn, X, TikTok, Pinterest
- **Beautiful Modern Dashboard** — Analytics, calendar, media library, reports
- **Enterprise Security** — OWASP ASVS compliant, Argon2, JWT + refresh tokens, rate limiting, helmet, CSP, audit logs
- **Production Ready** — Docker, Nginx, GitHub Actions, Prisma migrations, testing

## 🚀 Quick Start (Single Command Deployment)

```bash
git clone <your-repo>
cd aether-smm

# 1. Start everything
docker compose up -d

# 2. (First time only) Setup database
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma generate

# 3. Pull the smallest AI model
docker compose exec ollama ollama pull llama3.2:1b

# 4. Access the platform
open http://localhost:3000
```

## 🛠 Technology Stack

### Frontend
- Next.js 15 + React 19 + TypeScript
- Tailwind + shadcn/ui + Framer Motion
- TanStack Query, Zustand, React Hook Form, Zod

### Backend
- NestJS + TypeScript
- PostgreSQL + Prisma
- Redis + BullMQ (queues)
- WebSockets
- JWT + Refresh Tokens + Argon2

### AI Engine
- Ollama (local LLMs)
- Automatic model selection (prefers smallest suitable model)
- Optional: ComfyUI / Automatic1111 for images & video

### Infrastructure
- Docker + Docker Compose
- Nginx (reverse proxy + SSL)
- GitHub Actions CI/CD

## 📁 Project Structure

```
aether-smm/
├── frontend/           # Next.js 15 App (Dashboard + UI)
├── backend/            # NestJS API + Prisma
├── docker-compose.yml  # Full stack orchestration
├── nginx/              # Production reverse proxy
├── prisma/             # Database schema
└── README.md
```

## 🔐 Security

The platform follows OWASP Top 10 and ASVS Level 2:

- Argon2id password hashing
- JWT + short-lived access + refresh tokens
- Rate limiting, Helmet, CSP, HSTS
- Input validation + output encoding
- Comprehensive audit logging
- RBAC ready
- Session & device management

## 📊 Core User Flow

1. Register / Login (Email + Google/GitHub/Microsoft OAuth ready)
2. Complete Business Profile (brand voice, colors, logo)
3. Upload Products (single, bulk CSV/Excel/ZIP)
4. Connect Telegram (for daily approvals)
5. Connect social accounts
6. AI automatically generates 1–2 posts/day
7. Content delivered to Telegram → Approve/Reject
8. Schedule or publish to platforms
9. Real-time analytics + export reports

## 🧠 AI Daily Planner

Every morning the AI:

- Detects relevant holidays/festivals/events
- Matches them to your business/products
- Generates high-quality captions + image prompts
- Creates relevant hashtags
- Sends content to Telegram for approval

## 📦 Deployment

### Development
```bash
docker compose up
```

### Production
```bash
docker compose --profile production up -d
```

Full deployment guide available in `/docs/DEPLOYMENT.md` (generated in the repo).

## 📖 Documentation

- [User Guide](./docs/USER_GUIDE.md)
- [Admin Guide](./docs/ADMIN_GUIDE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [API Documentation](http://localhost:3001/api/docs) (after launch)

## 🧪 Testing

```bash
# Backend
cd backend && npm run test

# Frontend
cd frontend && npm run test
```

## 🌟 Roadmap (Future Enhancements)

- ComfyUI integration for high-quality image generation
- Video generation pipeline (using open source models)
- Advanced analytics + AI performance insights
- Multi-tenant support for agencies
- Mobile PWA
- More social platforms

## 📜 License

MIT License — 100% Open Source & Free Forever

---

**Built with ❤️ for businesses that want powerful marketing tools without recurring costs.**

*Version 1.0.0 • Production-Ready • July 2026*