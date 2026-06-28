# BookVerse [![Quickdraw](https://img.shields.io/badge/Quickdraw-Achievement-gold?style=flat&logo=github)](https://github.com/khushnawaj)

A production-ready MERN stack social platform for book lovers. Dark-mode-first UI inspired by Linear, Notion, Spotify, and modern Goodreads.

## Project Structure

```
book-library/
├── client/                 # React 19 + Vite frontend
│   └── src/
│       ├── app/
│       ├── assets/
│       ├── components/     # common, ui, layout, animations
│       ├── features/       # auth, books, wishlist, dashboard
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── store/
│       ├── utils/
│       ├── constants/
│       └── schemas/
├── server/                 # Express + MongoDB backend
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── services/
│       ├── models/
│       ├── routes/
│       ├── middlewares/
│       ├── validators/
│       ├── utils/
│       ├── constants/
│       ├── jobs/
│       └── sockets/
├── package.json            # Root scripts (concurrent dev)
└── ROADMAP.md
```

## Installation

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Git

### 1. Clone & install dependencies

```bash
cd book-library
npm run install:all
npm install
```

### 2. Environment variables

**Server** — copy and configure:

```bash
cp server/.env.example server/.env
```

**Client** — copy and configure:

```bash
cp client/.env.example client/.env
```

| Variable | Location | Description |
|----------|----------|-------------|
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_ACCESS_SECRET` | server | Access token secret (32+ chars) |
| `JWT_REFRESH_SECRET` | server | Refresh token secret (32+ chars) |
| `CLIENT_URL` | server | Frontend URL for CORS |
| `VITE_API_BASE_URL` | client | Backend API base URL |

### 3. Run development servers

```bash
# Both servers concurrently
npm run dev

# Or individually
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

### 4. Verify setup

- API root: `http://localhost:5000/`
- Health check: `http://localhost:5000/api/v1/health`
- Frontend: `http://localhost:5173/`

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite, Redux Toolkit, React Router, Tailwind CSS v4, shadcn/ui patterns, Framer Motion, Zod, React Hook Form |
| Backend | Node.js, Express 5, Mongoose, JWT, bcryptjs, express-validator, multer |
| Dev Tools | ESLint, Prettier, Husky |

## Phase 1 Progress

| Step | Status | Scope |
|------|--------|-------|
| **Step 1** | ✅ Complete | Project foundation, folder structure, env config, UI shell |
| Step 2 | Pending | MongoDB schemas, models, validators |
| Step 3 | Pending | Authentication (JWT + refresh tokens) |
| Step 4 | Pending | Books & Library CRUD APIs |
| Step 5 | Pending | Wishlist, Reviews, Dashboard stats |
| Step 6 | Pending | Full frontend feature wiring |

See [ROADMAP.md](./ROADMAP.md) for the full development plan.

## shadcn/ui

The project uses shadcn/ui conventions with Tailwind v4. Add components via:

```bash
cd client
npx shadcn@latest add button card input label
```

Configuration: `client/components.json`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run client + server |
| `npm run build` | Build frontend for production |
| `npm run lint` | Lint both packages |

---

Built with enterprise-level architecture. Step-by-step implementation — approve each phase before proceeding.
