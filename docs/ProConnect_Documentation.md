# ProConnect - Project Documentation

## Introduction
ProConnect is a next-generation professional networking platform that seamlessly integrates networking, job matching, freelancing, and learning. It is built as a modern web application using cutting-edge technologies.

## Technology Stack
- **Frontend**: Next.js 14+ (React), TypeScript, Tailwind CSS, Framer Motion.
- **Backend**: NestJS, TypeScript, Prisma ORM.
- **Database**: PostgreSQL.

## How the Website Works (Core Modules)

### 1. Authentication and User Roles
The platform supports a robust Role-Based Access Control (RBAC) system. Users can register and sign in under different roles:
- **Professional**: Standard users seeking jobs and networking.
- **Recruiter**: Users posting job opportunities.
- **Freelancer**: Users offering freelance services and bidding on projects.
- **Startup Founder & Investor**: Dedicated roles for startup networking and funding.
- **Admin**: Platform administrators with access to the Admin Portal.

### 2. User Profiles
Users can build comprehensive profiles that showcase:
- **Experience and Education**: History of their professional and academic journey.
- **Skills**: Verified skills with percentage indicators and endorsements from other users.
- **Portfolio**: A showcase of previous projects with media and links.

### 3. Job Board
A fully functional job portal where:
- Recruiters can post job listings (Full-time, Part-time, Contract).
- Professionals can search, save, and apply for jobs.
- Applications can be tracked and managed by the recruiters.

### 4. Freelance Marketplace
A space for gig work and short-term contracts:
- Users can post projects with specific budgets.
- Freelancers can submit proposals and bids.
- Includes milestone tracking, dedicated messaging, and a review system for completed work.

### 5. Networking and Community
- **Connections & Followers**: Users can send connection requests or follow others to see their updates.
- **Social Feed**: Users can create posts, like, and comment on other users' content.
- **Messaging**: Real-time direct messaging and project-based conversations.
- **Communities**: Interest-based groups (e.g., Tech, Industry-specific) where members can share posts and discuss topics.

### 6. Learning Platform & Skill Verification
- **Courses**: Instructors can upload video modules and notes. Users can enroll and track their learning progress.
- **Skill Tests**: Timed assessments to verify user skills. Passing these tests awards Skill Badges that are displayed on the user's profile.

### 7. Monetization and Premium Features
- **Subscriptions**: Users can upgrade to premium tiers (e.g., Premium, Recruiter Pro) to access advanced features like profile boosting, advanced analytics, and enhanced visibility.
- **Advertisements**: Admins can manage sponsored content and advertisements displayed across the platform.

### 8. Admin Portal
A comprehensive dashboard for platform administrators to manage:
- Users and profiles.
- Job postings and courses.
- Subscriptions and subscribers.
- Advertisements and platform monetization.

## Project Structure
- **`/frontend`**: Contains the Next.js application, UI components, pages (authentication, admin portal, marketplace, feed, etc.), and role-gating logic.
- **`/backend`**: Contains the NestJS application, API controllers, services, and the Prisma schema (`schema.prisma`) which defines the entire database architecture.

---
