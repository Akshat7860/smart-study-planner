const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── CORS ────────────────────────────────────────────────────────────────────
// Allow both localhost:5173 (Vite dev) AND any value set in CLIENT_URL (.env)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean); // remove undefined/empty values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
}));

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json());          // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev'));            // Log every request

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/subjects',  require('./routes/subjects'));
app.use('/api/sessions',  require('./routes/sessions'));
app.use('/api/timetable', require('./routes/timetable'));

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Smart Study Planner API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  if (err.message.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: err.message });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`🗄️  MongoDB URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ NOT SET — check .env'}`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET — check .env'}`);
});
