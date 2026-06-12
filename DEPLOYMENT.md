# Shop Stock Zen - Deployment Guide

A comprehensive guide for deploying the Shop Stock Zen full-stack application to production environments.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Production Build](#production-build)
5. [Deployment Options](#deployment-options)
6. [Database Setup](#database-setup)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Troubleshooting](#troubleshooting)
9. [Security Checklist](#security-checklist)

---

## Project Overview

Shop Stock Zen is a full-stack inventory management application designed for small to medium businesses. It provides real-time stock tracking, supplier management, order processing, and analytics dashboard.

### Technology Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| **Backend** | Express.js + TypeScript |
| **Database** | PostgreSQL with Prisma ORM |
| **Authentication** | JWT (JSON Web Tokens) |
| **Default Ports** | Frontend: 8080, Backend: 3000 |

---

## Prerequisites

### Node.js Requirements

**Minimum Version**: Node.js 18.x or higher

Check your Node.js version:

```bash
node --version
```

Recommended: Use [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) to manage multiple Node.js versions:

```bash
# Install nvm (Linux/macOS)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 20
nvm install 20
nvm use 20
```

### Package Manager

You can use either npm, pnpm, or yarn. This guide uses npm as the default.

```bash
# npm (recommended)
npm --version

# or pnpm
pnpm --version

# or yarn
yarn --version
```

### PostgreSQL Requirements

- **Version**: PostgreSQL 14.x or higher
- **Local Development**: PostgreSQL installed locally or via Docker
- **Production**: Cloud-hosted PostgreSQL (see Database Setup section)

### Additional Tools

- **Git**: For version control
- **Docker** (optional): For containerized deployment
- **Prisma**: Database ORM (installed via npm)

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd shop-stock-zen-main
```

### 2. Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### 3. Environment Variables Setup

Create environment files for both frontend and backend.

#### Backend `.env` File

Create a `backend/.env` file:

```env
# Database Connection
# Format: postgresql://username:password@host:port/database_name
DATABASE_URL="postgresql://user:password@localhost:5432/shopstockzen?schema=public"

# JWT Configuration
# Generate a secure secret: openssl rand -base64 32
JWT_SECRET="your-super-secret-key-change-in-production"

# Server Configuration
PORT=3000

# CORS Configuration
# Comma-separated list of allowed origins (frontend URLs)
CORS_ORIGIN=http://localhost:8080,http://localhost:5173
```

#### Frontend `.env` File (Optional)

Create a `frontend/.env` file:

```env
# API Base URL (defaults to http://localhost:3000/api/v1 if not set)
VITE_API_URL=http://localhost:3000/api/v1
```

### 4. Database Setup

#### Prisma Setup

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations to create database tables
npm run prisma:migrate
```

### 5. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

The backend will start at `http://localhost:3000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:8080`

### Sample .env.example Files

#### backend/.env.example

```env
# Database Connection
# Replace user, password, and database_name with your PostgreSQL credentials
DATABASE_URL="postgresql://user:password@localhost:5432/shopstockzen?schema=public"

# JWT Secret - Generate a strong random string
JWT_SECRET="your-secret-key-here"

# Server Port
PORT=3000

# CORS Origins - Frontend URLs (comma-separated)
CORS_ORIGIN=http://localhost:8080,http://localhost:5173
```

#### frontend/.env.example

```env
# Backend API URL (optional - defaults to http://localhost:3000/api/v1)
VITE_API_URL=http://localhost:3000/api/v1
```

---

## Production Build

### 1. Backend Production Build

```bash
cd backend

# Install production dependencies (if not already done)
npm install --production

# Build TypeScript
npm run build

# The compiled JavaScript will be in the dist/ folder
```

### 2. Frontend Production Build

```bash
cd frontend

# Build for production
npm run build

# The static files will be in the dist/ folder
```

The frontend build process creates optimized, minified files ready for deployment to any static hosting service.

---

## Deployment Options

### Frontend Deployment

#### Option 1: Vercel (Recommended)

Vercel provides the easiest deployment experience for React/Vite applications.

**Steps:**

1. **Prepare for Deployment:**

   ```bash
   cd frontend

   # Create vercel.json for configuration
   ```

2. **Deploy via CLI:**

   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

3. **Deploy via GitHub:**

   - Push your code to GitHub
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Select your repository
   - Configure:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Click "Deploy"

4. **Environment Variables:**

   In Vercel dashboard, go to Project Settings > Environment Variables:

   ```
   VITE_API_URL= http://localhost:3000/api/v1
   ```

**Advantages:**
- Automatic SSL
- Global CDN
- Preview deployments
- Zero configuration

---

#### Option 2: Netlify

**Steps:**

1. **Create netlify.toml** in the `frontend/` directory:

   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via CLI:**

   ```bash
   npm i -g netlify-cli
   cd frontend
   netlify deploy --prod --dir=dist
   ```

3. **Deploy via GitHub:**

   - Connect your GitHub repo to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

4. **Environment Variables:**

   Add in Netlify dashboard > Site Settings > Environment Variables:

   ```
   VITE_API_URL=<your-backend-url>/api/v1
   ```

**Advantages:**
- Form handling
- Identity management
- Edge functions

---

#### Option 3: Render

**Steps:**

1. **Create render.yaml** in the `frontend/` directory:

   ```yaml
   services:
     - type: static
       name: shop-stock-zen-frontend
       buildCommand: npm run build
       publishDir: dist
       envVars:
         - key: VITE_API_URL
           value: <your-backend-url>/api/v1
   ```

2. **Deploy:**

   - Connect your GitHub repository
   - Render will automatically detect the static site

---

### Backend Deployment

#### Option 1: Render (Recommended for Backend)

**Steps:**

1. **Prepare Backend:**

   ```bash
   cd backend
   # Ensure package.json has "start" script
   # Already configured: "start": "node dist/index.js"
   ```

2. **Deploy via Render Dashboard:**

   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" > "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
   - Add Environment Variables:
     ```
     DATABASE_URL=<your-postgresql-connection-string>
     JWT_SECRET=<your-jwt-secret>
     PORT=3000
     CORS_ORIGIN=<your-frontend-url>
     ```

3. **Database Connection:**

   Render provides managed PostgreSQL. Create a PostgreSQL service and connect it:

   - Create a new PostgreSQL instance in Render
   - Copy the internal database URL
   - Add to your web service's environment variables

**Advantages:**
- Free tier available
- Automatic deployments
- Managed PostgreSQL option

---

#### Option 2: Railway

**Steps:**

1. **Install Railway CLI:**

   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Deploy:**

   ```bash
   cd backend
   railway init
   railway deploy
   ```

3. **Set Environment Variables:**

   ```bash
   railway variables set DATABASE_URL=<your-db-url>
   railway variables set JWT_SECRET=<your-secret>
   railway variables set PORT=3000
   railway variables set CORS_ORIGIN=<your-frontend-url>
   ```

4. **Database:**

   ```bash
   railway add postgresql
   ```

**Advantages:**
- Easy database setup
- Preview environments
- Simple scaling

---

#### Option 3: Fly.io

**Steps:**

1. **Install Fly CLI:**

   ```bash
   brew install flyctl  # macOS
   # Or: winget install flyctl  # Windows
   ```

2. **Initialize:**

   ```bash
   cd backend
   fly launch
   ```

3. **Configure fly.toml:**

   ```toml
   app = "shop-stock-zen-backend"

   [build]
     builder = "peterc/builder:latest"

   [[services]]
     http_checks = []
     internal_port = 3000
     processes = ["app"]
     protocol = "tcp"
     script = null
   ```

4. **Deploy:**

   ```bash
   fly deploy
   ```

5. **Set Secrets:**

   ```bash
   fly secrets set DATABASE_URL=<your-db-url>
   fly secrets set JWT_SECRET=<your-secret>
   fly secrets set CORS_ORIGIN=<your-frontend-url>
   ```

**Advantages:**
- Edge deployment
- Persistent volumes
- Great for global apps

---

#### Option 4: DigitalOcean App Platform

**Steps:**

1. **Create spec.yaml** in the `backend/` directory:

   ```yaml
   name: shop-stock-zen-backend
   region: nyc
   services:
     - name: api
       github:
         repo: your-username/shop-stock-zen
         branch: main
         path: /backend
       build_command: npm install && npm run build
       run_command: npm start
       http_port: 3000
       instance_count: 1
       instance_size_slug: basic-xs
       env_vars:
         - key: DATABASE_URL
           value: ${db.DATABASE_URL}
         - key: JWT_SECRET
           value: ${secret.JWT_SECRET}
         - key: CORS_ORIGIN
           value: ${var.CORS_ORIGIN}
   databases:
     - name: db
       engine: PG
       version: "14"
   ```

2. **Deploy via Control Panel:**

   - Select your repository
   - Choose "Backend" as the source
   - Configure environment variables

**Advantages:**
- Managed database
- HTTPS by default
- Easy scaling

---

## Database Setup

### Local PostgreSQL Setup

#### Using Docker (Recommended)

```bash
# Pull and run PostgreSQL container
docker run -d \
  --name shopstockzen-db \
  -e POSTGRES_USER=shopuser \
  -e POSTGRES_PASSWORD=shoppassword \
  -e POSTGRES_DB=shopstockzen \
  -p 5432:5432 \
  postgres:15

# Verify it's running
docker ps
```

#### Using PostgreSQL Installer

1. Download from [postgresql.org](https://www.postgresql.org/download/)
2. Run the installer
3. Create a database:
   ```bash
   psql -U postgres
   CREATE DATABASE shopstockzen;
   CREATE USER shopuser WITH PASSWORD 'shoppassword';
   GRANT ALL PRIVILEGES ON DATABASE shopstockzen TO shopuser;
   ```

### Cloud PostgreSQL Options

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| **Render** | Yes | Auto-provisioned with backend |
| **Railway** | $5/month | Easy setup |
| **Neon** | Yes | Serverless PostgreSQL |
| **Supabase** | Yes | Includes auth & storage |
| **ElephantSQL** | Yes | Simple managed hosting |
| **DigitalOcean** | $7/month | Included in App Platform |

### Prisma Migration

```bash
cd backend

# Development
npm run prisma:migrate

# Production (when schema changes)
npx prisma migrate deploy
```

### Database Schema

The application uses the following main models:
- **User**: Authentication and business profile
- **Product**: Inventory items with stock levels
- **Supplier**: Vendor management
- **Order**: Purchase orders
- **OrderItem**: Line items in orders
- **Activity**: Audit logging
- **Alert**: Low stock notifications
- **Notification**: User notifications

---

## Environment Variables Reference

### Backend Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | - |
| `JWT_SECRET` | Yes | Secret key for JWT signing | - |
| `PORT` | No | Server port | 3000 |
| `CORS_ORIGIN` | No | Allowed CORS origins | localhost:8080 |

### Frontend Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `VITE_API_URL` | No | Backend API base URL | `http://localhost:3000/api/v1` |

---

## Troubleshooting

### Common Deployment Errors

#### CORS Errors

**Error:** `Access to fetch at 'https://api...' has been blocked by CORS policy`

**Solutions:**

1. **Check CORS_ORIGIN in backend:**
   ```env
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

2. **Update backend/src/index.ts** to handle production origins:
   ```typescript
   const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? allowedOrigins 
       : true
   }));
   ```

#### Database Connection Issues

**Error:** `Error: P1001: Can't reach database server`

**Solutions:**

1. **Verify DATABASE_URL format:**
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
   ```

2. **Check database is running:**
   ```bash
   # For local
   pg_isready -h localhost -p 5432
   
   # For cloud - check connection string
   ```

3. **Whitelist IP:** For cloud databases, ensure your deployment platform's IP is whitelisted.

#### JWT Token Issues

**Error:** `401 Unauthorized` or `Token expired`

**Solutions:**

1. **Verify JWT_SECRET matches** between environments
2. **Check token expiry** in backend auth middleware
3. **Clear local storage** in browser for stale tokens

#### Frontend Build Failures

**Error:** `Module not found` or build errors

**Solutions:**

```bash
# Clear node_modules and rebuild
cd frontend
rm -rf node_modules
rm -rf dist
npm install
npm run build
```

#### Port Configuration Issues

**Error:** `EADDRINUSE: address already in use`

**Solutions:**

```bash
# Find and kill process using the port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :3000
kill -9 <PID>
```

---

## Security Checklist

### Environment Variables

- [ ] **Never commit** `.env` files to version control
- [ ] Use `.env.example` with placeholder values only
- [ ] Add `.env` to `.gitignore`
- [ ] Use different secrets for each environment

### JWT Secrets

- [ ] Generate a strong secret (minimum 256-bit):
  ```bash
  # macOS/Linux
  openssl rand -base64 32
  
  # Windows (PowerShell)
  [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))
  ```
- [ ] Rotate secrets periodically
- [ ] Use different secrets for staging/production

### Database Security

- [ ] Use strong database passwords
- [ ] Enable SSL for database connections
- [ ] Implement IP whitelisting
- [ ] Use connection pooling with limits

### API Security

- [ ] Implement rate limiting
- [ ] Use HTTPS in production
- [ ] Validate all user inputs
- [ ] Implement proper error handling (don't leak sensitive data)

### General Best Practices

- [ ] Keep dependencies updated
- [ ] Run security audits:
  ```bash
  npm audit
  ```
- [ ] Use environment-specific configurations
- [ ] Implement logging and monitoring
- [ ] Set up proper backup strategies

---

## Quick Reference Commands

### Development
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Build
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Database
```bash
cd backend
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
```

### Environment Check
```bash
node --version    # Node.js version
npm --version     # npm version
psql --version    # PostgreSQL version
```

---

## Support

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Review the project README
3. Check the backend API documentation at `/api/v1/docs` (when running locally)

---

*Last Updated: May 2026*
