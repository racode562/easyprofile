require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./db');
const { router: authRoutes, authenticateToken } = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const https = require('https');
const fs = require('fs-extra');
const path = require('path');
const morgan = require('morgan');
const cron = require('node-cron');

const app = express();

// Middleware for logging
app.use(morgan('combined'));

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  skip: (req) => {
    // Skip rate limiting for SSE endpoint
    return req.path === '/api/profiles/generate' && req.method === 'GET';
  }
});
app.use(limiter);

// Body Parser and Cookie Parser
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? "http://localhost:3000"
    : "https://my-prod-domain.com",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// Pre-flight requests
app.options('*', cors(corsOptions));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Connect to MongoDB
connectDB();

// Seed admin user with hashed password "admin"
async function seedAdminUser() {
  try {
    const existing = await User.findOne({ username: 'admin' });
    if (!existing) {
      const hashed = await bcrypt.hash('admin', 10);
      const admin = new User({
        username: 'admin',
        password: hashed,
        role: 'admin'
      });
      await admin.save();
      console.log('Seeded admin/admin user (hashed).');
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  }
}
seedAdminUser();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', authenticateToken, profileRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Scheduled profile cleanup
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const users = await User.find({});

    for (const user of users) {
      // Remove expired jobs and their profiles
      const expiredJobs = user.jobs.filter(job => job.expiresAt <= now);
      const expiredProfiles = user.profiles.filter(profile => {
        // Remove profiles that are expired or belong to expired jobs
        // Handle profiles without jobId and those belonging to expired jobs
        if (profile.expiresAt <= now) return true;
        if (!profile.jobId) return false;
        return expiredJobs.some(job => job._id.toString() === profile.jobId.toString());
      });
      
      // Remove corresponding filesystem images
      const userProfilePath = path.join(__dirname, '..', 'uploads', 'profile_pictures', user.username);
      
      for (const profile of expiredProfiles) {
        // Remove image files
        for (const image of profile.images) {
          try {
            await fs.remove(image.path);
          } catch (removeError) {
            console.error(`Error removing image: ${image.path}`, removeError);
          }
        }
      }

      // Remove expired jobs and profiles from user
      user.jobs = user.jobs.filter(job => job.expiresAt > now);
      user.profiles = user.profiles.filter(profile => {
        // Keep profiles that are not expired and either have no jobId or belong to an active job
        if (profile.expiresAt <= now) return false;
        if (!profile.jobId) return true;
        return user.jobs.some(job => job._id.toString() === profile.jobId.toString());
      });
      await user.save();

      // Remove empty user directories
      try {
        const userFiles = await fs.readdir(userProfilePath);
        if (userFiles.length === 0) {
          await fs.remove(userProfilePath);
        }
      } catch (err) {
        // Directory might not exist, which is fine
        console.log('No profile directory found for user:', user.username);
      }
    }

    console.log('Expired profiles cleaned up');
  } catch (error) {
    console.error('Profile cleanup error:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
