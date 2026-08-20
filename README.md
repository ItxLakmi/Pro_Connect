# ProConnect – Next-Gen Professional Networking Platform

ProConnect is an enterprise-grade professional networking platform integrating professional profiles, recruiter matching, freelance marketplace, social feeds, interactive learning hub, startup investor portal, and platform monetization.

---

## 🚀 Project Architecture Overview

This repository is structured as a workspace monorepo managing both the frontend and backend applications:

```text
Pro_Connect/
├── frontend/        # Next.js 16+ (App Router), TypeScript, Tailwind CSS, Playwright
├── backend/         # NestJS 11 REST & WebSocket API, Prisma ORM, Jest
├── docs/            # Architecture & PRD documentation
├── docker-compose.yml # Full-stack Docker deployment orchestration
├── package.json     # Root workspace configuration
└── LICENSE          # Proprietary & Client Transfer License Agreement
```

---

## 💻 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Socket.IO Client, Lucide Icons, Framer Motion
- **Backend**: NestJS 11, TypeScript, Prisma ORM 7, PostgreSQL, Passport JWT, Socket.IO, Nodemailer, PayHere SDK
- **Database**: PostgreSQL (Prisma ORM with 45+ models)
- **CI/CD & E2E**: GitHub Actions, Playwright (Frontend), Jest & Supertest (Backend)
- **DevOps**: Docker, Docker Compose, Multi-stage Dockerfiles

---

## 🛠 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: v15.x or higher (or Docker)

### 2. Environment Setup

#### Backend Environment Setup
Copy `backend/.env.example` to `backend/.env` and update configuration:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/pro_connect?schema=public"
JWT_SECRET="your-secure-jwt-secret-key"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

#### Frontend Environment Setup
Copy `frontend/.env.example` to `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 3. Database Initialization & Seeding
From the root directory:
```bash
# Generate Prisma Client
npx prisma generate --schema=backend/prisma/schema.prisma

# Push database schema / apply migrations
npx prisma db push --schema=backend/prisma/schema.prisma
```

### 4. Running Development Servers

#### Option A: Run Both Simultaneously (Recommended)
```bash
npm run dev
```
- **Frontend App**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:3001/api`

#### Option B: Run via Docker Compose
```bash
docker-compose up --build
```

---

## 🧪 Testing Suite

```bash
# Run Frontend E2E Tests (Playwright)
npm run test:e2e --workspace=frontend

# Run Backend Unit Tests (Jest)
npm run test:cov --workspace=backend

# Run Backend E2E Tests
npm run test:e2e --workspace=backend
```

---

## 🏗 Development Status & Roadmap

- ✅ **Phase 1**: Authentication, Role-based Access Control (RBAC - 8 Roles), User Profiles
- ✅ **Phase 2**: Job Board, Recruiter Portal, Applicant Tracking System (ATS)
- ✅ **Phase 3**: Freelance Marketplace, Project Bidding, Bidiing & Milestone Tracking
- ✅ **Phase 4**: Social Feed, Post Creation, Comments, Likes, Connection Network
- ✅ **Phase 5**: Real-time Messaging (Socket.IO) & In-App Notifications
- ✅ **Phase 6**: Learning Hub, Interactive Skill Tests, Courses & Certification Paths
- ✅ **Phase 7**: Investor & Startup Portal, Monetization (PayHere & Subscription Plans), Admin Portal

---

Prepared By: **ITX Digital Services (PVT) LTD**  
License: **Proprietary & Client Transfer License**
