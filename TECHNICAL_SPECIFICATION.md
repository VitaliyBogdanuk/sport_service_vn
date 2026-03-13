# Sports Management Service — Technical Specification

**Version:** 1.0  
**Based on:** Argon Dashboard 3 (Bootstrap 5) — `dashboard-template/`  
**Last Updated:** March 2025

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [UI Base: Argon Dashboard Template](#3-ui-base-argon-dashboard-template)
4. [Application Architecture](#4-application-architecture)
5. [Roles and Permissions](#5-roles-and-permissions)
6. [Routes and Pages (UI Mapping)](#6-routes-and-pages-ui-mapping)
7. [Database Models](#7-database-models)
8. [Public vs Protected UI](#8-public-vs-protected-ui)
9. [PWA Requirements](#9-pwa-requirements)
10. [Device Detection Logic](#10-device-detection-logic)
11. [Security Requirements](#11-security-requirements)
12. [Deployment Requirements](#12-deployment-requirements)
13. [File Structure](#13-file-structure)

---

## 1. Project Overview

The Sports Management Service is a monolithic Node.js application using EJS for server-side rendering. The application follows a **Mobile First** approach and supports two UI modes:

- **Mobile devices** — Progressive Web App (PWA)
- **Desktop devices** — Standard Web Version

The application is deployed as a single unit (frontend + backend together).

---

## 2. Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js (Express.js) |
| Template Engine | EJS |
| Database | MongoDB (MongoDB Atlas) |
| Authentication | JWT-based |
| UI Framework | Argon Dashboard 3 (Material Design / Bootstrap 5) |
| Deployment | Render or Vercel |
| Architecture | Monolithic |

---

## 3. UI Base: Argon Dashboard Template

The UI is based on **Argon Dashboard 3** (Creative Tim) from `dashboard-template/`.

### 3.1 Template Structure

```
dashboard-template/
├── assets/
│   ├── css/          # argon-dashboard.css, nucleo-icons
│   ├── fonts/        # Nucleo icons
│   ├── img/          # Images, illustrations, icons
│   ├── js/           # argon-dashboard.js, Bootstrap, Chart.js, etc.
│   └── scss/         # Source SCSS for customization
├── pages/
│   ├── sign-in.html
│   ├── sign-up.html
│   ├── dashboard.html
│   ├── profile.html
│   ├── tables.html
│   ├── billing.html
│   ├── virtual-reality.html
│   └── rtl.html
├── docs/
│   └── documentation.html
├── gulpfile.mjs
└── package.json
```

### 3.2 Key UI Components to Reuse

- **Layout:** Sidebar (`sidenav`), navbar, main content area
- **Auth Pages:** `sign-in.html`, `sign-up.html` — card-based forms
- **Dashboard:** `dashboard.html` — stats cards, charts, tables
- **Profile:** `profile.html` — user info forms, avatar section
- **Tables:** `tables.html` — data tables with search
- **Billing:** Can be adapted for documents / subscriptions if needed

### 3.3 EJS Integration

- Convert `.html` pages to `.ejs` templates
- Use `include` for reusable partials (sidebar, navbar, footer, scripts)
- Pass data via `res.render('page', { user, data, ... })`
- Use `<%= %>`, `<%- %>`, `<% %>` for dynamic content

---

## 4. Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Express Server                           │
├─────────────────────────────────────────────────────────────────┤
│  Middleware: helmet, cors, express.json, express.urlencoded      │
│  Device Detection → PWA Layout / Web Layout                      │
│  JWT Auth → Role-based access control                            │
├─────────────────────────────────────────────────────────────────┤
│  Routes                                                          │
│  ├── Public:  /, /players, /teams, /organizations, /login, ...   │
│  └── Protected: /admin/*, /coach/*, /player/*                    │
├─────────────────────────────────────────────────────────────────┤
│  Controllers → Services → Models (MongoDB)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Roles and Permissions

### 5.1 Administrator

| Permission | Description |
|------------|-------------|
| Full CRUD | All entities |
| Organizations | Create, read, update, delete |
| Teams | Create, read, update, delete |
| Users | Manage admins, coaches, players |
| Coach accounts | Create and send credentials via email |
| Admin panel | Full access |
| Profile | View and edit own profile |

### 5.2 Coach

| Permission | Description |
|------------|-------------|
| Players | CRUD within assigned team(s) |
| Team | View team information |
| Dashboard | Protected coach dashboard |
| Profile | View and edit own profile |

### 5.3 Player

| Permission | Description |
|------------|-------------|
| Registration | Self-register (email, last name, first name, middle name, DOB) |
| Authentication | JWT login |
| Profile | View and edit own profile |
| Documents | Upload personal documents after login |
| Area | Protected player area |

---

## 6. Routes and Pages (UI Mapping)

### 6.1 Public Routes (No Auth)

| Route | Template Base | Description | Public Data |
|-------|---------------|-------------|-------------|
| `GET /` | Dashboard variant | Landing / home | Summary stats (orgs, teams, players) |
| `GET /login` | `sign-in.html` | Login form | — |
| `GET /register` | `sign-up.html` | Player self-registration | — |
| `GET /players` | `tables.html` | Public player list | Avatar, Full Name, Age |
| `GET /teams` | `tables.html` | Public team list | Team name, org, player count |
| `GET /organizations` | `tables.html` | Public organization list | Name, team count |
| `GET /players/:id` | Profile card | Player public profile | Avatar, Full Name, Age |

**Search & filter:** Implement for public lists using existing Argon search input and table structure.

### 6.2 Protected Routes — Admin

| Route | Template Base | Description |
|-------|---------------|-------------|
| `GET /admin` | `dashboard.html` | Admin dashboard |
| `GET /admin/organizations` | `tables.html` | CRUD organizations |
| `GET /admin/teams` | `tables.html` | CRUD teams |
| `GET /admin/users` | `tables.html` | Manage users (admins, coaches, players) |
| `GET /admin/coaches/create` | `profile.html` / form | Create coach, send credentials |
| `GET /admin/profile` | `profile.html` | Admin profile |

### 6.3 Protected Routes — Coach

| Route | Template Base | Description |
|-------|---------------|-------------|
| `GET /coach` | `dashboard.html` | Coach dashboard |
| `GET /coach/team` | `tables.html` | View team, CRUD players |
| `GET /coach/players` | `tables.html` | Players in assigned team |
| `GET /coach/profile` | `profile.html` | Coach profile |

### 6.4 Protected Routes — Player

| Route | Template Base | Description |
|-------|---------------|-------------|
| `GET /player` | `dashboard.html` | Player area |
| `GET /player/profile` | `profile.html` | Edit profile, upload documents |
| `GET /player/documents` | `tables.html` or custom | List / manage documents |

### 6.5 Sidebar Adaptation by Role

| Section | Admin | Coach | Player |
|---------|-------|-------|--------|
| Dashboard | ✓ | ✓ | ✓ |
| Organizations | ✓ | — | — |
| Teams | ✓ | ✓ (own team) | — |
| Users | ✓ | — | — |
| Players | ✓ | ✓ (own team) | — |
| Documents | — | — | ✓ |
| Profile | ✓ | ✓ | ✓ |
| Sign Out | ✓ | ✓ | ✓ |

Use EJS conditionals to render role-specific sidebar items.

---

## 7. Database Models

### 7.1 Organization

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 7.2 Team

```javascript
{
  _id: ObjectId,
  name: String,
  organization: ObjectId,  // ref: Organization
  coach: ObjectId,        // ref: User (Coach)
  createdAt: Date,
  updatedAt: Date
}
```

### 7.3 User

```javascript
{
  _id: ObjectId,
  email: String,           // unique
  passwordHash: String,
  role: String,            // 'admin' | 'coach' | 'player'
  firstName: String,
  lastName: String,
  middleName: String,
  dateOfBirth: Date,       // required for players
  avatar: String,          // URL or path
  team: ObjectId,          // ref: Team (for coach/player)
  organization: ObjectId,  // ref: Organization (optional, for admins)
  createdAt: Date,
  updatedAt: Date
}
```

### 7.4 Document

```javascript
{
  _id: ObjectId,
  user: ObjectId,          // ref: User
  name: String,
  type: String,            // e.g. 'passport', 'medical', etc.
  url: String,             // storage path / URL
  mimeType: String,
  size: Number,
  createdAt: Date
}
```

---

## 8. Public vs Protected UI

### 8.1 Public Data (No Auth)

- **Displayed:** Avatar, Full Name, Age
- **Format:** Lists with search and filter
- **Sensitive data:** Never exposed (email, DOB, documents, etc.)

### 8.2 Protected UI

- JWT stored in `httpOnly` cookie or `localStorage` (per security policy)
- Session maintained via JWT token
- Role-based middleware: `requireAuth`, `requireRole(['admin'])`, etc.
- Redirect unauthenticated users to `/login`
- Redirect unauthorized roles to appropriate dashboard or 403

---

## 9. PWA Requirements

### 9.1 Core PWA Features

| Feature | Implementation |
|---------|----------------|
| **Mobile First** | Responsive layout from Argon Dashboard |
| **Service Worker** | Register `sw.js` for caching and offline |
| **Web App Manifest** | `manifest.json` with name, icons, theme_color, start_url |
| **Installable** | Install prompt on mobile |
| **Offline** | Cache static assets and key pages for offline viewing |

### 9.2 Manifest Example

```json
{
  "name": "Sports Management Service",
  "short_name": "Sports",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#5e72e4",
  "background_color": "#f8f9fa",
  "icons": [
    {
      "src": "/assets/img/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/img/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 9.3 Service Worker Strategy

- **Cache-first:** Static assets (CSS, JS, images)
- **Network-first:** API and dynamic pages (with fallback to cached shell)
- **Offline fallback:** Basic shell page for unauthenticated users

### 9.4 Push Notifications (Optional Future)

- Web Push API integration
- Backend: store subscription, send via web-push
- Use case: match reminders, document approval, etc.

---

## 10. Device Detection Logic

### 10.1 Detection Strategy

1. **User-Agent:** Detect mobile keywords (`Mobile`, `Android`, `iPhone`, etc.)
2. **Screen size:** `window.innerWidth < 768` or `matchMedia('(max-width: 768px)')`
3. **Combined:** Mobile UA **or** small viewport → PWA layout

### 10.2 Layout Modes

| Device | Layout | Notes |
|--------|--------|-------|
| Mobile | PWA | Full-screen shell, bottom nav optional, install banner |
| Desktop | Web | Sidebar, full Argon layout |

### 10.3 Backend Support

- Same routes and API for both
- Optional: `X-Device-Type` or query param for A/B or analytics
- Responsive CSS handles most layout differences

---

## 11. Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| **JWT Auth** | `jsonwebtoken`, configurable expiry |
| **Password Hashing** | bcrypt (salt rounds ≥ 10) |
| **Role-based Middleware** | `requireRole(['admin','coach'])` |
| **File Upload Validation** | Whitelist MIME types, size limits, virus scan if feasible |
| **Environment Variables** | JWT_SECRET, MONGODB_URI, etc. in `.env` |
| **HTTPS** | Enforced in production |
| **Security Headers** | helmet.js |

---

## 12. Deployment Requirements

| Requirement | Details |
|-------------|---------|
| Single deployment | Frontend + backend in one app |
| Environment variables | Set in Render / Vercel |
| MongoDB Atlas | Connection string, IP whitelist |
| Build | `npm run build` (if applicable), `npm start` |
| Logging | Structured logs, error tracking |
| Error handling | Global error handler, 404/500 pages |

---

## 13. File Structure (Proposed)

```
sport-service-vn/
├── dashboard-template/          # Source UI (reference)
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── db.js
│   │   └── auth.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── roles.js
│   │   └── device.js
│   ├── models/
│   │   ├── Organization.js
│   │   ├── Team.js
│   │   ├── User.js
│   │   └── Document.js
│   ├── routes/
│   │   ├── public.js
│   │   ├── admin.js
│   │   ├── coach.js
│   │   ├── player.js
│   │   └── auth.js
│   ├── controllers/
│   ├── services/
│   └── utils/
├── views/                       # EJS templates (adapted from dashboard-template)
│   ├── layouts/
│   │   ├── public.ejs
│   │   ├── dashboard.ejs
│   │   └── pwa.ejs
│   ├── partials/
│   │   ├── head.ejs
│   │   ├── sidebar.ejs
│   │   ├── navbar.ejs
│   │   └── scripts.ejs
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   ├── public/
│   │   ├── home.ejs
│   │   ├── players.ejs
│   │   ├── teams.ejs
│   │   └── organizations.ejs
│   ├── admin/
│   ├── coach/
│   └── player/
├── public/
│   ├── assets/                  # Copied/adapted from dashboard-template
│   ├── sw.js
│   └── manifest.json
├── uploads/                     # Document uploads (or use cloud storage)
├── .env.example
├── package.json
├── TECHNICAL_SPECIFICATION.md
└── README.md
```

---

## Appendix A: Template-to-EJS Conversion Checklist

- [ ] Create `views/layouts/dashboard.ejs` with sidebar, navbar, main content block
- [ ] Convert `sign-in.html` → `views/auth/login.ejs`
- [ ] Convert `sign-up.html` → `views/auth/register.ejs` (player fields: email, firstName, lastName, middleName, dateOfBirth)
- [ ] Convert `dashboard.html` → base for admin/coach/player dashboards
- [ ] Convert `profile.html` → base for profile pages + document upload section for players
- [ ] Convert `tables.html` → base for list views (players, teams, organizations, users)
- [ ] Create `views/partials/sidebar.ejs` with role-based navigation
- [ ] Add `<link rel="manifest">` and service worker registration in layout

---

## Appendix B: API Endpoints (REST)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/login` | No | — | Login, returns JWT |
| POST | `/api/auth/register` | No | — | Player registration |
| GET | `/api/players` | No | — | Public player list |
| GET | `/api/teams` | No | — | Public team list |
| GET | `/api/organizations` | No | — | Public org list |
| GET | `/api/admin/*` | Yes | Admin | Admin CRUD |
| GET | `/api/coach/*` | Yes | Coach | Coach CRUD |
| GET | `/api/player/*` | Yes | Player | Player profile, documents |

---

*End of Technical Specification*
