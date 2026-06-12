# ProConnect – Next-Gen Professional Networking Platform

ProConnect is a modern professional networking platform designed to integrate networking, job matching, freelancing, and learning.

## 🚀 Project Overview
This repository uses a monorepo structure to manage both the frontend and backend applications.

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, and Framer Motion.
- **Backend**: NestJS with TypeScript, Prisma ORM, and PostgreSQL.
- **Database**: PostgreSQL (Prisma).

## 📂 Directory Structure
```text
proconnect/
├── frontend/        # Next.js web application
├── backend/         # NestJS REST API
├── docs/            # [Git Branching Strategy](docs/git_branching_strategy.md)
├── package.json     # Root package manager configuration (workspaces)
└── .gitignore       # Root git ignore rules
```

## 🛠 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation
1. Clone the repository.
2. Run `npm install` in the root directory to install dependencies for both frontend and backend.
3. Configure the environment variables:
   - Create a `.env` file in the `backend/` directory based on `.env.example`.
   - Set your `DATABASE_URL` and `JWT_SECRET`.

### Development
You can run the development servers for both parts:

```bash
# Run frontend
npm run dev

# Run backend
npm run start:dev
```

## 🏗 Phases
- **Phase 1**: MVP (Authentication, Profiles, Job Board) - *In Progress*
- **Phase 2**: Marketplace & Messaging
- **Phase 3**: AI & Verification
- **Phase 4**: Learning Hub & Investor Matching

---
Prepared By: ITX Digital Services (PVT) LTD
Date: 06-March-2026
