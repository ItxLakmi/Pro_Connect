# 🚀 ProConnect — Master Production Deployment & Operations Manual

> **Document Version:** 2.0 (Final Client Release)  
> **Document Type:** End-to-End Infrastructure, Setup, Deployment & Operations Manual  
> **Target Audience:** DevOps Engineers, System Administrators, and Client Engineering Teams  
> **Application Architecture:** Next.js 16 (Frontend) + NestJS 11 (Backend & WebSockets) + PostgreSQL 16 (Database) + PayHere (Payment Gateway)  
> **Prepared By:** ITX Digital Services (PVT) LTD  

---

## 📋 Table of Contents
1. [System Requirements & Hardware Sizing](#1-system-requirements--hardware-sizing)
2. [Master Environment Variables Specification](#2-master-environment-variables-specification)
3. [Local Development Setup Guide](#3-local-development-setup-guide)
4. [Database Provisioning & Prisma Migrations](#4-database-provisioning--prisma-migrations)
5. [Option 1: Docker Compose Deployment (Recommended)](#5-option-1-docker-compose-deployment-recommended)
6. [Option 2: Native Node.js & PM2 Deployment on VPS](#6-option-2-native-nodejs--pm2-deployment-on-vps)
7. [Option 3: Managed Cloud Deployment (Vercel + Render / DigitalOcean)](#7-option-3-managed-cloud-deployment-vercel--render--digitalocean)
8. [Nginx Reverse Proxy, WebSockets & SSL Setup](#8-nginx-reverse-proxy-websockets--ssl-setup)
9. [UFW Firewall & Infrastructure Security](#9-ufw-firewall--infrastructure-security)
10. [PayHere Gateway Live Configuration](#10-payhere-gateway-live-configuration)
11. [Automated Database Backups & Log Maintenance](#11-automated-database-backups--log-maintenance)
12. [Troubleshooting & Diagnostics Matrix](#12-troubleshooting--diagnostics-matrix)
13. [Deployment Verification & Sign-Off Checklist](#13-deployment-verification--sign-off-checklist)

---

## 1. System Requirements & Hardware Sizing

### Production Server Hardware Recommendations

| Usage Tier | Concurrent Users | CPU | RAM | Storage | Recommended Hosting |
|---|---|---|---|---|---|
| **Small / Initial Launch** | Up to 1,000 active | 2 vCPU | 4 GB | 25 GB NVMe SSD | DigitalOcean / Linode $24/mo VPS |
| **Medium Growth** | Up to 10,000 active | 4 vCPU | 8 GB | 60 GB NVMe SSD | AWS EC2 (t4g.xlarge) / Hetzner |
| **Enterprise High Availability** | 50,000+ active | 8 vCPU + Load Balancer | 16 GB | 150 GB SSD + Managed DB | AWS ECS / Kubernetes + RDS PostgreSQL |

### Operating System & Core Dependencies
- **Supported OS:** Ubuntu 22.04 LTS / Ubuntu 24.04 LTS (64-bit)
- **Node.js Runtime:** Node.js v20.x LTS or v22.x LTS
- **Package Manager:** npm v10.x+
- **Database Engine:** PostgreSQL 15.x or 16.x
- **Process Manager:** PM2 v5.3+ (for non-Docker VPS setups)
- **Web Server & Reverse Proxy:** Nginx 1.18+ with HTTP/2 and WebSocket module enabled
- **SSL Engine:** Certbot 2.0+ (Let's Encrypt)

---

## 2. Master Environment Variables Specification

Ensure environment configuration files are created and restricted with file permissions (`chmod 600 .env`).

### 2.1 Backend Master Configuration (`backend/.env`)

```env
# ==============================================================================
# SERVER & ENVIRONMENT CONFIGURATION
# ==============================================================================
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://proconnect.yourdomain.com"

# ==============================================================================
# DATABASE CONNECTION (POSTGRESQL & PRISMA ORM)
# ==============================================================================
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://proconnect_user:YourStrongPassword123!@localhost:5432/pro_connect?schema=public&sslmode=prefer"
DIRECT_URL="postgresql://proconnect_user:YourStrongPassword123!@localhost:5432/pro_connect?schema=public"

# ==============================================================================
# JWT AUTHENTICATION & SECURITY
# ==============================================================================
# Minimum 64-character random string (e.g. openssl rand -base64 48)
JWT_SECRET="e9a8f7c6b5a43210fe9d8c7b6a543210e9a8f7c6b5a43210fe9d8c7b6a543210"
JWT_EXPIRATION="7d"

# ==============================================================================
# SMTP TRANSACTIONAL EMAIL (NODEMAILER)
# ==============================================================================
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=587
SMTP_USER="postmaster@mg.yourdomain.com"
SMTP_PASS="YourSecureSmtpPassword"
SMTP_FROM="\"ProConnect Platform\" <noreply@yourdomain.com>"

# ==============================================================================
# PAYHERE PAYMENT GATEWAY INTEGRATION
# ==============================================================================
PAYHERE_MERCHANT_ID="1234567"
PAYHERE_SECRET="4MXXXXXXXXXXXXX8O"
PAYHERE_MODE="live" # Set to 'sandbox' for testing, 'live' for production
```

---

### 2.2 Frontend Master Configuration (`frontend/.env.local`)

```env
# ==============================================================================
# PUBLIC CLIENT ENVIRONMENT VARIABLES (EXPOSED TO BROWSER)
# ==============================================================================
NEXT_PUBLIC_API_URL="https://api.proconnect.yourdomain.com/api"
NEXT_PUBLIC_WS_URL="https://api.proconnect.yourdomain.com"
NEXT_PUBLIC_SITE_URL="https://proconnect.yourdomain.com"
```

---

## 3. Local Development Setup Guide

### Step 1: Install All Workspace Dependencies
From the repository root directory (`Pro_Connect/`):
```bash
npm run install:all
```

### Step 2: Set Up Local Environment Files
```bash
# Copy Backend Environment Template
cp backend/.env.example backend/.env

# Copy Frontend Environment Template
cp frontend/.env.example frontend/.env.local
```

### Step 3: Initialize Database & Run Migrations
```bash
# Generate Prisma Client
npx prisma generate --schema=backend/prisma/schema.prisma

# Push Database Schema
npx prisma db push --schema=backend/prisma/schema.prisma
```

### Step 4: Start Local Development Servers
```bash
# Run both Frontend (port 3000) and Backend (port 3001) concurrently
npm run dev
```

---

## 4. Database Provisioning & Prisma Migrations

### Setting Up PostgreSQL on Ubuntu
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Switch to postgres user and create database + user
sudo -u postgres psql -c "CREATE DATABASE pro_connect;"
sudo -u postgres psql -c "CREATE USER proconnect_user WITH PASSWORD 'YourStrongPassword123!';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pro_connect TO proconnect_user;"
sudo -u postgres psql -d pro_connect -c "GRANT ALL ON SCHEMA public TO proconnect_user;"
```

### Deploying Database Migrations in Production
Run the following from the `backend/` folder whenever deploying updates:
```bash
# Apply pending Prisma migrations safely in production
npx prisma migrate deploy
```

---

## 5. Option 1: Docker Compose Deployment (Recommended)

Docker Compose encapsulates PostgreSQL, NestJS Backend, and Next.js Frontend into isolated containers.

### Step 1: Clone Repository & Create Docker Environment File
```bash
git clone https://github.com/ItxLakmi/Pro_Connect.git
cd Pro_Connect

# Create Root Docker Environment File
cat << 'EOF' > .env
POSTGRES_USER=proconnect_user
POSTGRES_PASSWORD=YourStrongPassword123!
POSTGRES_DB=pro_connect
JWT_SECRET=e9a8f7c6b5a43210fe9d8c7b6a543210e9a8f7c6b5a43210fe9d8c7b6a543210
NEXT_PUBLIC_API_URL=https://api.proconnect.yourdomain.com
EOF
```

### Step 2: Launch Docker Stack
```bash
# Build and run containers in background
docker-compose up --build -d

# Verify container status
docker-compose ps
```

### Step 3: Apply Database Migrations inside Backend Container
```bash
docker-compose exec backend npx prisma migrate deploy
```

---

## 6. Option 2: Native Node.js & PM2 Deployment on VPS

If running directly on Ubuntu without Docker:

### Step 1: Install Node.js 20 & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Step 2: Build Applications
```bash
# Install dependencies
npm run install:all

# Build Backend
cd backend && npm run build && cd ..

# Build Frontend
cd frontend && npm run build && cd ..
```

### Step 3: Configure PM2 Ecosystem (`ecosystem.config.js`)
Create `ecosystem.config.js` in the root directory:

```javascript
module.exports = {
  apps: [
    {
      name: 'proconnect-backend',
      script: 'dist/main.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'proconnect-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: './frontend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
```

### Step 4: Launch and Enable PM2 Startup
```bash
# Start applications with PM2
pm2 start ecosystem.config.js

# Save process list and enable system reboot auto-start
pm2 save
pm2 startup
```

---

## 7. Option 3: Managed Cloud Deployment (Vercel + Render / DigitalOcean)

### Deploying Frontend to Vercel
1. Log into [Vercel](https://vercel.com) and click **Add New Project**.
2. Connect your GitHub repository `Pro_Connect`.
3. Set **Root Directory** to `frontend`.
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://api.proconnect.yourdomain.com/api`
   - `NEXT_PUBLIC_WS_URL` = `https://api.proconnect.yourdomain.com`
5. Click **Deploy**.

### Deploying Backend to Render / DigitalOcean App Platform
1. Create a new **Web Service** connected to `Pro_Connect`.
2. Set **Root Directory:** `backend`
3. Set **Build Command:** `npm ci && npx prisma generate && npm run build`
4. Set **Start Command:** `npm run start:prod`
5. Configure all backend environment variables (`DATABASE_URL`, `JWT_SECRET`, `SMTP_*`, `PAYHERE_*`).

---

## 8. Nginx Reverse Proxy, WebSockets & SSL Setup

### Step 1: Install Nginx & Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Step 2: Create Master Nginx Configuration
Create `/etc/nginx/sites-available/proconnect`:

```nginx
# ==============================================================================
# FRONTEND APPLICATION PROXY (proconnect.yourdomain.com)
# ==============================================================================
server {
    listen 80;
    server_name proconnect.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ==============================================================================
# BACKEND API & SOCKET.IO WEBSOCKET PROXY (api.proconnect.yourdomain.com)
# ==============================================================================
server {
    listen 80;
    server_name api.proconnect.yourdomain.com;

    client_max_body_size 25M;

    # REST API Endpoints
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO Real-Time Engine Proxy
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 3: Enable Nginx & Issue Let's Encrypt SSL
```bash
# Enable config
sudo ln -s /etc/nginx/sites-available/proconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Issue free SSL Certificates
sudo certbot --nginx -d proconnect.yourdomain.com -d api.proconnect.yourdomain.com
```

---

## 9. UFW Firewall & Infrastructure Security

```bash
# Enable UFW Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH, HTTP, and HTTPS ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

---

## 10. PayHere Gateway Live Configuration

1. Log in to [PayHere Merchant Portal](https://www.payhere.lk).
2. Copy your **Merchant ID** and **Merchant Secret**.
3. Set your production domain Notification URL:
   `https://api.proconnect.yourdomain.com/api/monetization/webhook`
4. In `backend/.env`, set:
   ```env
   PAYHERE_MODE="live"
   PAYHERE_MERCHANT_ID="YourMerchantId"
   PAYHERE_SECRET="YourMerchantSecret"
   ```

---

## 11. Automated Database Backups & Log Maintenance

### Automated PostgreSQL Nightly Backup Script
Create `/usr/local/bin/backup_proconnect.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/proconnect"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Perform DB Dump
docker-compose -f /home/ubuntu/Pro_Connect/docker-compose.yml exec -T postgres pg_dump -U proconnect_user pro_connect > $BACKUP_DIR/pro_connect_$DATE.sql

# Compress backup file
gzip $BACKUP_DIR/pro_connect_$DATE.sql

# Delete backups older than 30 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -exec rm {} \;
```

Set executable permissions and configure Crontab:
```bash
sudo chmod +x /usr/local/bin/backup_proconnect.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup_proconnect.sh") | crontab -
```

---

## 12. Troubleshooting & Diagnostics Matrix

| Symptom / Issue | Possible Cause | Resolution Step |
|---|---|---|
| **502 Bad Gateway** | Node backend or PM2 process crashed / not listening on port 3001 | Run `pm2 status` or `docker-compose ps`. Check logs via `pm2 logs proconnect-backend`. |
| **CORS Blocked Error in Browser** | `FRONTEND_URL` in `backend/.env` does not match exact client origin domain | Ensure `FRONTEND_URL` matches `https://proconnect.yourdomain.com` without trailing slash. |
| **Real-time Chat / Socket.IO Fails** | Nginx missing `Upgrade` & `Connection` headers for `/socket.io/` | Verify Nginx `/socket.io/` proxy block contains `proxy_set_header Upgrade $http_upgrade;`. |
| **Prisma Migration Error (`P1001`)** | Database server unreachable or credentials invalid | Verify PostgreSQL service status (`systemctl status postgresql`) and test connection credentials. |
| **PayHere Payment Activation Fails** | Webhook URL inaccessible or signature hash mismatch | Verify `PAYHERE_SECRET` matches merchant portal and server domain uses valid HTTPS SSL. |

---

## 13. Deployment Verification & Sign-Off Checklist

- [x] Backend REST API responds with HTTP 200 on `GET /api` health check.
- [x] Frontend renders landing page and navigation routes clean of 404/500 errors.
- [x] User Registration and JWT Auth flow verified.
- [x] Prisma database schema deployed (`npx prisma migrate deploy`).
- [x] WebSocket Socket.IO handshake succeeds for real-time notifications.
- [x] PayHere payment webhook endpoint verified under HTTPS.
- [x] HTTPS SSL active and auto-renewal cron operational (`certbot renew --dry-run`).
- [x] Nightly PostgreSQL automated database backup cron enabled.
