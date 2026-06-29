const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');

const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ── SECURITY & PERFORMANCE MIDDLEWARE ─────────────────────────────────────────
// Security headers (CSP + COEP disabled to avoid blocking Cloudinary/external media)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Gzip payload compression
app.use(compression());

// Global API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 500, // limit each IP to 500 requests per 15 mins
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allow multiple origins: local dev + any production CLIENT_URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173', // vite preview
  process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to ShelfForge API',
    version: '1.0.0',
    docs: '/api/v1/health',
  });
});

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
