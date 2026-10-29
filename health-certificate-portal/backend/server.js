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

// Parse JSON bodies.
app.use(express.json({ limit: '2mb' }));

// Parse cookies (required for HTTP-only JWT session cookie).
app.use(cookieParser());

// CORS: allow both deployments and local dev, with credentials (cookies).
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }
      // Echo back the matching origin (required when credentials: true)
      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Helmet security headers (disable CSP so our inline assets/images load).
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

// Serve locally stored certificate photos.
app.use('/uploads', express.static(uploadsDir));

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

// Connect to MongoDB (Atlas or local), then start the server.
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`MongoDB URI: ${process.env.MONGO_ATLAS_URI ? 'Atlas' : process.env.MONGO_LOCAL_URI || 'local'}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });

module.exports = app;