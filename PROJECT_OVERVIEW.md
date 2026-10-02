# ShelfForge — Complete Project Overview & Technical Specification

> **ShelfForge** (also referenced as *BookVerse*) is a production-ready, full-stack **MERN** (MongoDB, Express, React, Node.js) web application designed as a modern social platform and interactive workspace for readers, book collectors, and self-publishing authors.

---

## 📋 Table of Contents
1. [Overview & Vision](#-overview--vision)
2. [Key Features & Capability Highlights](#-key-features--capability-highlights)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Database Schemas & Data Models](#-database-schemas--data-models)
6. [API Route Directory](#-api-route-directory)
7. [Frontend Architecture & Pages](#-frontend-architecture--pages)
8. [Project Directory Structure](#-project-directory-structure)
9. [Local Development & Environment Setup](#-local-development--environment-setup)

---

## 🌟 Overview & Vision

Traditional book tracking applications often lack rich social interaction and modern design aesthetics. **ShelfForge** bridges the gap between **Goodreads** (library tracking, shelf management, reading goals) and **Wattpad / Medium** (writing, chapter publishing, poetry styling), delivering all of it inside a sleek, dark-mode-first glassmorphic user interface.

### Core Value Propositions:
- **For Readers**: Organize books into interactive 3D visual shelves, track reading dates and pages, generate visual analytics, set reading goals, and import library data via CSV/Excel.
- **For Writers & Poets**: Write and publish original multi-chapter stories, poems, blogs, and diaries with customizable backdrops, spoiler tags, and chapter ratings.
- **For the Community**: Share reviews, book quotes, reading progress check-ins, follow fellow readers, like, comment, and bookmark posts.

---

## 🚀 Key Features & Capability Highlights

### 1. 📚 Interactive Library & 3D Visual Bookshelf
- **Mahogany Shelf Canvas**: Displays books on realistic 3D wooden shelf renders separated into status categories (`Reading`, `Read`, `Want to Read`, `Dropped`).
- **Shelf Management**: Set star ratings (1–5), detailed reviews, personal notes, start dates, and finish dates.
- **Bulk Import**: Support for importing books in bulk using standard CSV or Excel (`.xlsx`) templates with automatic field mapping and duplicate handling.

### 2. ✍️ Writing Studio & Reader Workspace
- **Self-Publishing Hub**: Dedicated studio page to write, edit, draft, and publish works categorized into `STORY`, `POEM`, `BLOG`, or `DIARY`.
- **Chapter & Content Management**: Multi-chapter authoring with automatic word count calculations, chapter numbering, and draft/published visibility toggles.
- **Reader Experience**: Clean, distraction-free reading mode (`ReadWorkPage.jsx`) complete with chapter navigation, reader ratings, and comments.

### 3. 🌐 Social Feed & Reader Community
- **Chronological Social Feed**: Share text posts, book recommendations, quote cards, and reading progress updates (e.g., *Reading Page 140 of 350*).
- **Post Customization**: Attach images (Cloudinary integration), flag spoiler warnings, and apply custom background gradients for poetry posts.
- **Engagement**: Nested comment threads, post likes, saved posts (bookmarks), and follower-based feed aggregation.

### 4. 📊 Reading Analytics & Gamification
- **Visual Analytics**: Interactive charts built with **Recharts** displaying monthly reading volume, genre distribution breakdowns, and shelf composition.
- **Reading Goals**: Set time-bounded targets for books read or pages completed with live progress bars.
- **Achievements**: Gamified milestone system that automatically awards badges upon reaching reading goals.

### 5. 👤 Profile & Avatar Personalization
- **DiceBear Avatar Integrations**: Live vector avatar generator supporting multiple style presets (*Adventurer*, *Lorelei*, *Bottts*, *Pixel Art*, *Avataaars*, *Croodles*).
- **Profile Customization**: Pen name, bio, custom profile banner image, user stats, and tabbed view for shelves, published works, activity history, and saved posts.

### 6. 🔍 Google Books API & Search
- Quick search against the external **Google Books API** to import titles, cover images, descriptions, page counts, and ISBN numbers directly into the platform.

### 7. 🛡️ Admin Dashboard & Moderation
- Global admin overview to manage users, update user roles (`USER`, `ADMIN`), inspect platform growth stats, and process user feedback submissions.

---

## 🛠️ Technology Stack

### **Frontend**
| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **React 19** + **Vite 8** | High-performance single page application setup with fast HMR |
| **State Management** | **Redux Toolkit (RTK)** | Global state slices for auth, books, feed, wishlist, dashboard, theme |
| **Routing** | **React Router DOM v7** | Client-side routing with public & protected route guards |
| **Styling** | **Tailwind CSS v4** | Custom glassmorphism dark theme using CSS variables |
| **UI Components** | **Radix UI** + **Lucide Icons** | Accessible UI primitives and icon set |
| **Animations** | **Framer Motion** & **Lottie** | Smooth page transitions and dynamic empty states |
| **Forms & Validation** | **React Hook Form** + **Zod** | Type-safe form validation schemas |
| **Charts** | **Recharts** | Interactive data visualization for reading analytics |
| **Utilities** | **html2canvas**, **date-fns** | Canvas rendering for quote cards & date formatting |

### **Backend**
| Category | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | **Node.js 20+** | Asynchronous JavaScript runtime environment |
| **Web Framework** | **Express 5** | REST API routing and middleware pipeline |
| **Database** | **MongoDB Atlas** + **Mongoose 9** | NoSQL document database with strict schema definitions |
| **Caching & Rate Limit** | **Redis (Upstash)** + `express-rate-limit` | Session storage, caching, and rate limiting |
| **Authentication** | **JWT** + **bcryptjs** | Dual-token mechanism: short-lived Access Tokens & HttpOnly Refresh Cookies |
| **File Storage** | **Multer** + **Cloudinary** | Image processing and cloud media storage |
| **Data Parsers** | **csv-parser** & **xlsx** | File processing for CSV and Excel book import pipelines |
| **Security** | **Helmet**, **CORS**, **Compression** | HTTP security headers, CORS origin protection, response compression |

---

## 🏗️ System Architecture

```
                       ┌─────────────────────────────────────────┐
                       │          React 19 Frontend Client       │
                       │   (Vite, Redux Toolkit, Tailwind CSS)   │
                       └───────────────────┬─────────────────────┘
                                           │
                                  HTTP / REST API (Axios)
                                  With Cookie Credentials
                                           │
                                           ▼
                       ┌─────────────────────────────────────────┐
                       │            Express 5 API Server         │
                       │     (Auth Middleware, Controllers)      │
                       └───────────┬─────────────────┬───────────┘
                                   │                 │
                ┌──────────────────┘                 └──────────────────┐
                ▼                                                       ▼
  ┌───────────────────────────┐                           ┌───────────────────────────┐
  │      MongoDB Database     │                           │     Redis (Upstash) Cache │
  │ (User, Book, Library, etc)│                           │ (Rate Limit & Session Log)│
  └───────────────────────────┘                           └───────────────────────────┘
```

---

## 💾 Database Schemas & Data Models

The database consists of **15 interconnected Mongoose schemas** located in `server/src/models/`:

### 1. `User` Model ([User.model.js](file:///d:/book-library/server/src/models/User.model.js))
- **Fields**: `name`, `username` (unique), `email` (unique), `password` (hashed, hidden by default), `avatar`, `bannerImage`, `bio`, `penName`, `role` (`USER`, `ADMIN`, `GUEST`), `isVerified`, `booksRead`, `followersCount`, `followingCount`, `refreshToken` (select: false).
- **Methods**: `comparePassword()`, `toPublicProfile()`.

### 2. `Book` Model ([Book.model.js](file:///d:/book-library/server/src/models/Book.model.js))
- **Fields**: `title`, `author`, `publisher`, `publicationDate`, `isbn`, `genre`, `language`, `pages`, `coverImage`, `description`, `purchaseLinks` (`[{ platform, url }]`), `owner` (ref: `User`).
- **Indexes**: Text search index on `title`, `author`, `genre`. Sparse index on `isbn`.

### 3. `Library` Model ([Library.model.js](file:///d:/book-library/server/src/models/Library.model.js))
- **Fields**: `user` (ref: `User`), `book` (ref: `Book`), `shelfType` (`READ`, `READING`, `WISHLIST`, `DROPPED`), `rating` (1–5), `review`, `notes`, `startedAt`, `finishedAt`.
- **Virtuals**: `readingDurationDays`, `bookDetails`.
- **Hooks**: Automatically manages reading dates based on shelf status changes.

### 4. `Work` Model ([Work.model.js](file:///d:/book-library/server/src/models/Work.model.js))
- **Fields**: `title`, `slug`, `contentType` (`STORY`, `POEM`, `BLOG`, `DIARY`), `language` (`English`, `Hindi`, `Hinglish`), `genre`, `summary`, `coverImage`, `author` (ref: `User`), `status` (`DRAFT`, `PUBLISHED`), `visibility` (`PUBLIC`, `FOLLOWERS`, `PRIVATE`), `isCompleted`, `chapters` (`[{ title, content, status, chapterNumber, wordCount, publishedAt, likes, ratings }]`), `likes`, `stats` (`{ views, likesCount, readsCount, totalWordCount }`).
- **Hooks**: Pre-save hook computes total word count across all chapters automatically.

### 5. `Post` Model ([Post.model.js](file:///d:/book-library/server/src/models/Post.model.js))
- **Fields**: `author` (ref: `User`), `content`, `images`, `visibility` (`PUBLIC`, `FOLLOWERS`, `PRIVATE`), `hashtags`, `likesCount`, `commentsCount`, `bookRef`, `activityRef`, `poetryBg`, `poetryPosition`, `isSpoiler`, `readingProgress` (`{ page, totalPages, chapter }`), `quoteRef` (`{ quoteText, quoteAuthor, bookTitle }`).

### 6. `Goal` Model ([Goal.model.js](file:///d:/book-library/server/src/models/Goal.model.js))
- **Fields**: `user` (ref: `User`), `title`, `targetType` (`BOOKS`, `PAGES`), `targetValue`, `currentValue`, `startDate`, `endDate`, `status` (`ACTIVE`, `COMPLETED`, `FAILED`).
- **Virtuals**: `progressPercentage`.

### 7. `Comment` Model ([Comment.model.js](file:///d:/book-library/server/src/models/Comment.model.js))
- **Fields**: `author` (ref: `User`), `postRef` (ref: `Post`), `workRef` (ref: `Work`), `chapterId`, `parentComment` (nested reply), `content`, `likesCount`, `likes`.

### 8. `Follow` Model ([Follow.model.js](file:///d:/book-library/server/src/models/Follow.model.js))
- **Fields**: `follower` (ref: `User`), `following` (ref: `User`).
- **Constraint**: Unique compound index `{ follower: 1, following: 1 }`.

### 9. `Like` Model ([Like.model.js](file:///d:/book-library/server/src/models/Like.model.js))
- **Fields**: `user` (ref: `User`), `targetType` (`POST`, `COMMENT`, `WORK`, `CHAPTER`), `targetId`.

### 10. `Activity` Model ([Activity.model.js](file:///d:/book-library/server/src/models/Activity.model.js))
- **Fields**: `user` (ref: `User`), `type` (`ADDED_BOOK`, `UPDATED_SHELF`, `COMPLETED_BOOK`, `PUBLISHED_WORK`, `CREATED_POST`, `CREATED_GOAL`, `ACHIEVED_GOAL`), `targetModel`, `targetId`, `metadata`.

### 11. `Achievement` Model ([Achievement.model.js](file:///d:/book-library/server/src/models/Achievement.model.js))
- **Fields**: `user` (ref: `User`), `badgeId`, `title`, `description`, `icon`, `unlockedAt`.

### 12. `Notification` Model ([Notification.model.js](file:///d:/book-library/server/src/models/Notification.model.js))
- **Fields**: `recipient` (ref: `User`), `sender` (ref: `User`), `type` (`FOLLOW`, `LIKE`, `COMMENT`, `GOAL_COMPLETED`, `ACHIEVEMENT`), `link`, `read`.

### 13. `SavedPost` Model ([SavedPost.model.js](file:///d:/book-library/server/src/models/SavedPost.model.js))
- **Fields**: `user` (ref: `User`), `post` (ref: `Post`).

### 14. `Feedback` Model ([Feedback.model.js](file:///d:/book-library/server/src/models/Feedback.model.js))
- **Fields**: `user` (ref: `User`), `subject`, `category`, `message`, `status` (`PENDING`, `IN_REVIEW`, `RESOLVED`).

### 15. `ImportHistory` Model ([ImportHistory.model.js](file:///d:/book-library/server/src/models/ImportHistory.model.js))
- **Fields**: `user` (ref: `User`), `source` (`CSV`, `EXCEL`, `GOODREADS`), `totalRecords`, `importedRecords`, `failedRecords`, `errors`, `status`.

### 16. `WritingTracker` Model ([WritingTracker.model.js](file:///d:/book-library/server/src/models/WritingTracker.model.js))
- **Fields**: `user` (ref: `User`), `work` (ref: `Work`, optional), `title`, `contentType` (`NOVEL`, `STORY`, `POEM`, `SERIAL`, `OTHER`), `genre`, `language`, `trackerStatus` (`IDEA`, `OUTLINING`, `DRAFTING`, `EDITING`, `COMPLETED`, `ON_HOLD`, `ABANDONED`), `plannedChapters`, `externalCounts` (`{ drafted, edited, published }`), `publications` (`[{ platform, url, episodesPublished, lastPublishedAt }]`), `whereILeftOff`, `nextAction`, `lastWorkedAt`, `priority`, `isArchived`.
- **Constraint**: Unique partial index `{ user: 1, work: 1 }` for linked works.

### 17. `WritingLog` Model ([WritingLog.model.js](file:///d:/book-library/server/src/models/WritingLog.model.js))
- **Fields**: `user` (ref: `User`), `tracker` (ref: `WritingTracker`), `date`, `wordsWritten`, `note`.
- **Indexes**: Compound index `{ user: 1, date: -1 }`.

---

## 📡 API Route Directory

All backend endpoints are mounted under `/api/v1`:

| Route Prefix | File | Description |
| :--- | :--- | :--- |
| `/api/v1/auth` | [`auth.routes.js`](file:///d:/book-library/server/src/routes/auth.routes.js) | Register, login, logout, session refresh, get current user |
| `/api/v1/books` | [`book.routes.js`](file:///d:/book-library/server/src/routes/book.routes.js) | Book CRUD, search, filter by genre/language, ISBN lookup |
| `/api/v1/library` | [`library.routes.js`](file:///d:/book-library/server/src/routes/library.routes.js) | User library shelf management (`READ`, `READING`, `WISHLIST`, `DROPPED`) |
| `/api/v1/works` | [`work.routes.js`](file:///d:/book-library/server/src/routes/work.routes.js) | Writing studio API, chapter publishing, reader ratings, work feed |
| `/api/v1/posts` | [`post.routes.js`](file:///d:/book-library/server/src/routes/post.routes.js) | Create posts, like/unlike posts, comment threads, save posts |
| `/api/v1/feed` | [`feed.routes.js`](file:///d:/book-library/server/src/routes/feed.routes.js) | Aggregated social feed (Global vs Following stream) |
| `/api/v1/users` | [`user.routes.js`](file:///d:/book-library/server/src/routes/user.routes.js) | Profile fetching, avatar updates, follow/unfollow user endpoints |
| `/api/v1/dashboard` | [`dashboard.routes.js`](file:///d:/book-library/server/src/routes/dashboard.routes.js) | Summary stats for user home dashboard |
| `/api/v1/analytics` | [`analytics.routes.js`](file:///d:/book-library/server/src/routes/analytics.routes.js) | Aggregate charts data (reading velocity, genre distribution) |
| `/api/v1/upload` | [`upload.routes.js`](file:///d:/book-library/server/src/routes/upload.routes.js) | Cloudinary upload handler for book covers, post images, banners |
| `/api/v1/google-books` | [`googleBooks.routes.js`](file:///d:/book-library/server/src/routes/googleBooks.routes.js) | Integration proxy to search Google Books API |
| `/api/v1/notifications`| [`notification.routes.js`](file:///d:/book-library/server/src/routes/notification.routes.js)| Fetch & mark user notifications as read |
| `/api/v1/feedback` | [`feedback.routes.js`](file:///d:/book-library/server/src/routes/feedback.routes.js) | User feedback submission and status tracker |
| `/api/v1/tracker` | [`tracker.routes.js`](file:///d:/book-library/server/src/routes/tracker.routes.js) | Writing project tracker CRUD, status board, word session logging & streak |
| `/api/v1/admin` | [`admin.routes.js`](file:///d:/book-library/server/src/routes/admin.routes.js) | Admin metrics, role management, content moderation |

---

## 🖥️ Frontend Architecture & Pages

The application is structured logically around pages and Redux Toolkit features:

### Core Pages (`client/src/pages/`):
- **`LandingPage.jsx`**: Public landing page showcasing platform highlights & features.
- **`DashboardPage.jsx`**: User home dashboard with current reading progress, active goals, and quick actions.
- **`LibraryPage.jsx`**: The 3D Mahogany Bookshelf visualizer and table view for personal collection.
- **`BookDetailsPage.jsx`**: In-depth book information, community reviews, purchase links, and shelf toggles.
- **`WritingStudioPage.jsx`**: Workspace for authors to draft and manage original works.
- **`WritingEditorPage.jsx`**: Chapter editor with text formatting, draft saving, and layout tools.
- **`ExploreWritingPage.jsx`**: Community writing discovery page filtering stories, poems, blogs, and diaries.
- **`ReadWorkPage.jsx`**: Reader mode for community works with chapter selector and feedback forms.
- **`FeedPage.jsx`**: Community social timeline with post filters, spoiler hides, and comment modals.
- **`ProfilePage.jsx`**: User profile with custom avatar selector, reading history, and original works.
- **`AnalyticsPage.jsx`**: Comprehensive reading statistics and interactive Recharts visualizations.
- **`ImportBooksPage.jsx`**: CSV/Excel bulk upload manager with real-time error logging.
- **`AdminDashboard.jsx`**: Superuser panel for system administration.

---

## 📁 Project Directory Structure

```
book-library/
├── client/                     # React 19 + Vite Frontend Application
│   ├── src/
│   │   ├── app/                # Redux store initialization
│   │   ├── components/         # Shared & feature UI components (Bookshelf, Navbars, Modals)
│   │   ├── constants/          # Application constants & theme tokens
│   │   ├── features/           # RTK slices (auth, books, feed, library, wishlist, analytics)
│   │   ├── hooks/              # Custom React hooks (useAuth, useTheme, etc.)
│   │   ├── lib/                # Utility helpers & class merger (clsx, tailwind-merge)
│   │   ├── pages/              # Main view components / routes
│   │   ├── routes/             # Router config & protected route wrappers
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Axios HTTP client configuration & API handlers
│   │   └── utils/              # Helper functions (date formatting, string helpers)
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js + Express 5 Backend API
│   ├── src/
│   │   ├── config/             # DB (Mongoose), Redis, and Cloudinary connections
│   │   ├── constants/          # System HTTP status codes, shelf enums, user roles
│   │   ├── controllers/        # Request handlers (Auth, Book, Work, Feed, Library, Admin)
│   │   ├── middlewares/        # JWT verification, role guards, error handling, Multer
│   │   ├── models/             # 15 Mongoose Schemas (User, Book, Library, Work, Post, etc.)
│   │   ├── routes/             # Express routes mounting API endpoints
│   │   ├── services/           # Business logic & external API integration (Google Books)
│   │   └── utils/              # APIResponse, APIError handling classes
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Entry point server runner
│
├── package.json                # Root npm workspace configuration (Concurrently scripts)
├── README.md                   # Quick start README
└── PROJECT_OVERVIEW.md         # Full project technical breakdown (This File)
```

---

## ⚙️ Local Development & Environment Setup

### Prerequisites
- **Node.js**: `v20.x` or later
- **MongoDB**: Local MongoDB server or MongoDB Atlas cluster URI
- **Redis**: Local Redis server or Upstash Redis connection URI

### 1. Install Dependencies
Run the root script to install dependencies across root, `client/`, and `server/`:
```bash
npm install
npm run install:all
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/bookverse
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend (`client/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Launch Development Environment
Start both the Express backend server and the Vite frontend client concurrently:
```bash
npm run dev
```

- **Client**: `http://localhost:5173`
- **API Server**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/v1/health`

---

## 💡 Summary

**ShelfForge** is a feature-rich, scalable platform combining personal library management, social community networking, self-publishing, and reading analytics into a single cohesive MERN application. Its modular design makes it easy for developers to extend schemas, add new social features, or integrate additional reading tools.
