// Health Certificate Verification Portal - Backend entry point.
// Express + MongoDB (Mongoose) + JWT auth with HTTP-only cookies.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const certificateRoutes = require('./routes/certificates');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 4000;

// Allowed frontend origins (both deployments + local dev).
const MAIN_URL = process.env.MAIN_DEPLOYMENT_URL || '';
const BACKUP_URL = process.env.BACKUP_DEPLOYMENT_URL || '';
const LOCAL_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [LOCAL_URL, MAIN_URL, BACKUP_URL].filter(Boolean);

// Local folder for certificate photos when Cloudinary is not configured.
const uploadsDir = path.join(__dirname, 'uploads');

// --- Middleware ---

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl, mobile apps, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.error('Blocked by CORS:', origin, 'Allowed:', allowedOrigins);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

app.use('/uploads', express.static(uploadsDir));

// --- Ensure DB is connected before handling any request (serverless-safe) ---
let isConnected = false;
app.use(async (_req, res, next) => {
  if (isConnected) return next();
  try {
    await connectDB();
    isConnected = true;
    next();
  } catch (error) {
    console.error('DB connection failed:', error.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// --- Routes ---

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'health-certificate-portal-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/settings', settingsRoutes);

// --- 404 handler ---
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// Local dev only — Vercel ignores this and calls the app directly.
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;