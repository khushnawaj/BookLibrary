# BookVerse

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/khushnawaj/BookLibrary?style=social)](https://github.com/khushnawaj/BookLibrary)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat&logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com)

A premium, production-ready MERN stack social platform for book lovers. Features a sleek, dark-mode-first UI inspired by modern design paradigms like Linear, Notion, and Spotify.

---

## 🚀 Key Features

* **3D Mahogany Bookshelf Canvas**: A highly interactive, responsive visual bookshelf displaying books on individual wooden shelves (`Want to Read`, `Reading`, `Read`) complete with spine styling, title labels, and wooden textures.
* **Interactive Profile Customizer**: Real-time vector avatar selector powered by DiceBear API. Users can shuffle seeds, type custom names, and preview styles (Adventurer, Lorelei, Bottts, Pixel Art, Avataaars, Croodles) live with automatic grid rendering.
* **Chronological Social Feed**: Share reading thoughts, checkins, and book reviews. Includes a feed controller for follower aggregation, nested commenting, and real-time like toggles.
* **Comprehensive Library Tracking**: Add books, set reading progress dates (with date validators preventing finish dates from predating starts), and record 1-5 star ratings and detailed reviews.
* **Authentication Core**: Robust JWT flow utilizing secure HTTP-only cookies for refresh tokens and storage-based access tokens with auto-refresh middleware.
* **Visual Analytics Dashboard**: Track monthly reading volume, genre distribution, shelf statistics, and reading progress charts.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Redux Toolkit, React Router, Tailwind CSS, Framer Motion, Lucide Icons, Shadcn/ui |
| **Backend** | Node.js, Express 5, Mongoose ODM, JWT, bcryptjs, multer, express-validator |
| **Database & Caching** | MongoDB Atlas, Redis (Upstash) |

---

## 📂 Project Structure

```
book-library/
├── client/                 # React 19 + Vite frontend
│   └── src/
│       ├── components/     # UI shell, common, layout, animations (e.g., BookShelfView.jsx)
│       ├── features/       # RTK Slices (auth, books, wishlist, dashboard)
│       ├── pages/          # ProfilePage, LibraryPage, SocialPage, Dashboard
│       ├── services/       # API integration layer
│       └── constants/      # App configurations & theme schemas
├── server/                 # Express + MongoDB backend
│   └── src/
│       ├── config/         # Database, Redis, and Cloudinary config
│       ├── controllers/    # Authentication, Feed, Books, and Profile handlers
│       ├── models/         # Mongoose User, Book, Library, Follow, and Comment schemas
│       └── middlewares/    # Auth verification, error handling, file upload
```

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js 20+
* MongoDB (Local or Atlas Cluster)
* Redis Credentials (for rate-limiting/session storage)

### 1. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/khushnawaj/BookLibrary.git
cd BookLibrary
npm install
npm run install:all
```

### 2. Configure Environment Variables
Create a `.env` file in both `client/` and `server/` directories based on the templates:

**Server Configuration (`server/.env`):**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bookverse
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
REDIS_URL=your_redis_url
```

**Client Configuration (`client/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Run the Application
Start both the frontend client and the backend server concurrently in development mode:
```bash
npm run dev
```
* **Frontend client**: `http://localhost:5173/`
* **Backend API**: `http://localhost:5000/`

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
