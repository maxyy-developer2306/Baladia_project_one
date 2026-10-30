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
app.set('trust proxy', 1); // Vercel proxy ke liye (rate limit + secure cookies)
const PORT = process.env.PORT || 4000;

// Allowed frontend origins (hardcoded + env + local dev).
const allowedOrigins = [
  'https://app-balady-gov-sa-gold.vercel.app',

  'http://localhost:5173',
  'http://localhost:3000',
  process.env.MAIN_DEPLOYMENT_URL,
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((u) => u.replace(/\/+$/, '')); // trailing slash hata do



// --- CORS (sab se pehle, taake error pe bhi headers jayen) ---
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false); // error throw nahi, bas block
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// --- Middleware ---
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);



// --- DB connection (serverless-safe, cached) ---
let dbReady = null;
app.use(async (_req, res, next) => {
  try {
    if (!dbReady) dbReady = connectDB();
    await dbReady;
    await seedAdmin();
    next();
  } catch (error) {
    dbReady = null; // agli request pe dobara try kare
    console.error('DB connection failed:', error.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// --- Routes ---
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'health-certificate-portal-backend',
    message: 'Backend is running. API endpoints are under /api/ and /.',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'health-certificate-portal-backend' });
});

app.get('/api/debug/cloudinary', (_req, res) => {
  res.json({
    cloudinaryConfigured: !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
    hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
  });
});

// Dono paths support: /api/auth/... aur /auth/...
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/certificates', certificateRoutes);
app.use('/certificates', certificateRoutes);

app.use('/api/settings', settingsRoutes);
app.use('/settings', settingsRoutes);

// --- 404 handler ---
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// Sirf local pe listen karo, Vercel pe nahi
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Admin user seed karo env se (sirf agar pehle se nahi hai)
let adminSeeded = false;
async function seedAdmin() {
  if (adminSeeded) return;
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) return;
  const bcrypt = require('bcryptjs');
  const User = require('./models/User');
  try {
    const existing = await User.findOne({ username: process.env.ADMIN_USERNAME });
    if (!existing) {
      let hash = process.env.ADMIN_PASSWORD_HASH;
      if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$')) {
        hash = await bcrypt.hash(process.env.ADMIN_PASSWORD_HASH, 10);
      }
      await User.create({ username: process.env.ADMIN_USERNAME, passwordHash: hash });
      console.log('Admin user seeded:', process.env.ADMIN_USERNAME);
    }
    adminSeeded = true;
  } catch (err) {
    console.error('Admin seed error:', err.message);
  }
}

module.exports = app;