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
   # Or set ADMIN_EMAIL / ADMIN_PASSWORD in .env; coach stays coach@example.com / coach123
   ```

### Vercel: сід при першому деплої

1. У **Environment Variables** додай:
   - `MONGODB_URI`, `JWT_SECRET`, інші як у `.env.example`
   - **`GENERATE_ICONS=true`** — на білді збираються favicon/PWA/Apple з одного `icon-1024.png` (або лише `vercel.json` buildCommand)
   - **`RUN_DB_SEED=true`** (рядок саме `true`)
   - **`ADMIN_EMAIL`**, **`ADMIN_PASSWORD`** — логін першого адміна (не лишай дефолт у проді)

2. Задеплой. Після старту застосунок підключиться до MongoDB і виконає сід (ідемпотентно).

3. Після успішного деплою **вимкни сід**: зміни `RUN_DB_SEED` на `false` або видали змінну — щоб не ганяти зайві запити на кожному cold start.

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

## Іконки (без важкого git)

- У репо комітиться лише **`public/assets/img/icons/icon-1024.png`**.
- Після `git clone`: `npm install` → **`npm run icons`** (локально з’являться решта PNG + `apple-icon.png` / `favicon.png`).
- **Vercel:** `buildCommand` у `vercel.json` вже з **`GENERATE_ICONS=true`** — іконки на кожному деплої.
- **Xcode:** `GENERATE_IOS_APPICON=true npm run icons` → `ios/AppIcon.appiconset` (не в git).
