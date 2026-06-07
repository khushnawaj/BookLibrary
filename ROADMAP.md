# BookVerse — Development Roadmap

## Phase 1: Foundation & Core Features

### Step 1 — Project Foundation ✅

- [x] Monorepo structure (`client/` + `server/`)
- [x] Backend Express app with middleware pipeline
- [x] MongoDB connection config
- [x] API response utilities & error handling
- [x] Frontend Vite + React 19 scaffold
- [x] Tailwind CSS v4 dark theme (glassmorphism)
- [x] shadcn/ui foundation (`components.json`, base UI components)
- [x] Redux store architecture (slices scaffolded)
- [x] Axios API service layer
- [x] React Router with public/private route guards
- [x] Zod validation schemas
- [x] Environment variable templates
- [x] Landing page + layout shells

---

### Step 2 — Database & Models

**Backend**

- [ ] User model (name, username, email, password, avatar, bio, role, isVerified, refreshToken)
- [ ] Book model (title, author, publisher, ISBN, genre, cover, etc.)
- [ ] Library model (user, book, shelfType, rating, review, notes, dates)
- [ ] Mongoose indexes & virtuals
- [ ] Seed script for development data

**Deliverables:** Working models, schema validation, DB connection tested with sample data.

---

### Step 3 — Authentication System

**Backend**

- [ ] Register / Login / Logout controllers
- [ ] JWT access + refresh token strategy (httpOnly cookies)
- [ ] Auth middleware (protect routes)
- [ ] Token refresh endpoint
- [ ] User profile GET/PATCH endpoints
- [ ] express-validator schemas

**Frontend**

- [ ] Login & Register forms (React Hook Form + Zod)
- [ ] Auth Redux thunks / RTK Query
- [ ] Protected route wiring with real auth state
- [ ] Token refresh interceptor
- [ ] Profile & Settings pages

**Deliverables:** Full auth flow end-to-end.

---

### Step 4 — Books & Library

**Backend**

- [ ] Book CRUD controllers & services
- [ ] Library entry management (shelf types: READ, READING, WISHLIST, DROPPED)
- [ ] Search & filter (title, author, genre, shelf)
- [ ] Pagination

**Frontend**

- [ ] My Library page with book grid/list
- [ ] Add/Edit book modal forms
- [ ] Search & filter UI
- [ ] Book detail view

**Deliverables:** Complete library management.

---

### Step 5 — Wishlist, Reviews & Dashboard

**Backend**

- [ ] Wishlist add/remove endpoints
- [ ] Rating, review, notes on library entries
- [ ] Dashboard stats aggregation (total, read, reading, wishlist counts)

**Frontend**

- [ ] Wishlist page
- [ ] Review/rating components
- [ ] Dashboard with live stats
- [ ] Toast notifications for actions

**Deliverables:** All Phase 1 features functional.

---

### Step 6 — Polish & Production Readiness

- [ ] ESLint + Prettier configs finalized
- [ ] Husky pre-commit hooks
- [ ] Error boundaries & loading states
- [ ] Responsive mobile navigation
- [ ] API rate limiting
- [ ] Input sanitization audit
- [ ] Production build & deployment docs

---

## Phase 2+ (Future)

- Cloudinary image uploads
- Social features (follow, feed, activity)
- Real-time notifications (WebSockets)
- Book recommendations
- OAuth (Google/GitHub)
- Email verification
- Admin panel

---

## Architecture Decisions

| Concern | Decision |
|---------|----------|
| Auth tokens | JWT access (short) + refresh (httpOnly cookie) |
| State management | Redux Toolkit slices per feature domain |
| API versioning | `/api/v1/*` prefix |
| Styling | Tailwind v4 + CSS variables, dark-first |
| Validation | Zod (frontend) + express-validator (backend) |
| File uploads | multer → Cloudinary (Phase 2) |

---

**Next step:** Approve Step 1, then proceed to **Step 2 — Database & Models**.
