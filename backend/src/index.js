require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const https = require('https');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const app = express();

// Middleware for logging
app.use(morgan('combined'));

// Security Middlewares
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

// Body Parser
app.use(express.json());

// CORS Configuration
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
  }));
} else {
  app.use(cors({
    origin: "https://my-prod-domain.com",
    credentials: true
  }));
}

app.use(cookieParser());

// Connect to Mongo
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

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// HTTPS Setup for Production
if (process.env.NODE_ENV === 'production') {
  const sslPath = path.join(__dirname, 'ssl');
  const options = {
    key: fs.readFileSync(path.join(sslPath, 'server.key')),
    cert: fs.readFileSync(path.join(sslPath, 'server.crt'))
  };
  https.createServer(options, app).listen(process.env.PORT, () => {
    console.log(`Backend running securely on port ${process.env.PORT}`);
  });
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}
