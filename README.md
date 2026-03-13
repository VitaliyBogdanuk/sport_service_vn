# Sports Management Service

Monolithic Node.js application with EJS templates and PWA support. UI based on Argon Dashboard 3 (Bootstrap 5).

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   ```bash
   cp .env.example .env
   # Edit .env: set MONGODB_URI, JWT_SECRET
   ```

3. **Seed data** (optional)
   ```bash
   npm run seed-admin
   # Admin: admin@example.com / admin123
   # Coach: coach@example.com / coach123 (assigned to Sample Team)
   ```

4. **Run**
   ```bash
   npm run dev   # development (watch mode)
   npm start     # production
   ```

## Roles

- **Admin** — Full CRUD: organizations, teams, users, coaches
- **Coach** — CRUD players in assigned team
- **Player** — Self-register, view/edit profile, upload documents

## Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Home |
| `/players`, `/teams`, `/organizations` | Public | Public lists (search) |
| `/login`, `/register` | Public | Auth |
| `/admin` | Admin | Admin dashboard |
| `/coach` | Coach | Coach dashboard |
| `/player` | Player | Player area |

## Features

- **Auth:** Login, register, forgot password, JWT, rate limiting, CSRF
- **Email:** Coach credentials on creation, password reset (requires SMTP)
- **Profiles:** Edit profile, avatar upload (JPEG/PNG/GIF/WebP, 2MB)
- **Health:** `GET /health` returns `{ status: 'ok' }`

## Tech Stack

- Node.js, Express, EJS
- MongoDB (Mongoose)
- JWT auth, bcrypt, nodemailer
- Argon Dashboard 3 (Bootstrap 5)
- PWA (manifest, service worker)
