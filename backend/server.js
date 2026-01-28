require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Helmet adds various HTTP headers for protection
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow loading images/files
  contentSecurityPolicy: false // Disable CSP for development flexibility
}));

// Load models (ensures tables are created)
require('./models/AuditLog');

// Security: CORS configuration - restrict to frontend origin
// Security: CORS configuration - restrict to frontend origin
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174', // Vite alternate
      'http://localhost:5175', // Vite alternate
      'http://localhost:3000', // React default
      'http://127.0.0.1:5173'
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      // In dev, we might want to be permissive for localhost
      if (origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};
app.use(cors(corsOptions));

// Security: Rate limiting - general API limit (stricter for sensitive data)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Increased for dev usage
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Connexion à MySQL
require('./models/SiteContent'); // Ensure model is loaded before sync
sequelize.sync() // Removed { alter: true } to prevent index duplication bug
  .then(() => console.log('MySQL connecté et tables synchronisées'))
  .catch(err => console.error('Erreur MySQL :', err));

// Security: Stricter rate limit for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Increased for dev usage
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general rate limit to all API routes
app.use('/api/', generalLimiter);

// Routes
const usersRouter = require('./routes/users');
app.use('/api/users/login', authLimiter); // Apply strict limit to login
app.use('/api/users', usersRouter);

// Other routes
app.use('/api/cases', require('./routes/cases'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/contact-info', require('./routes/contactInfo'));
app.use('/api/content', require('./routes/siteContent'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/upload', require('./routes/upload'));

// Health check route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
