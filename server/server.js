const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const supabase = require('./config/supabase');
const seedDB = require('./seed/seedData');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/mandi', require('./routes/mandiRoutes'));
app.use('/api/demand', require('./routes/demandRoutes'));
app.use('/api/pools', require('./routes/poolRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health & Info Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'KisanConnect SIH26033 Backend API is running smoothly on Supabase PostgreSQL',
    database: 'Supabase PostgreSQL',
    auth: 'Supabase Auth',
    timestamp: new Date().toISOString(),
    version: '2.0.0-Supabase'
  });
});

// Demo accounts endpoint for SIH hackathon evaluation
app.get('/api/demo-accounts', (req, res) => {
  res.json({
    success: true,
    accounts: [
      {
        role: 'farmer',
        label: 'Demo Farmer (Ramesh Patel - MP)',
        email: 'farmer@kisanconnect.in',
        password: 'password123'
      },
      {
        role: 'farmer3',
        label: 'Demo Farmer (Suresh Patil - MH)',
        email: 'farmer3@kisanconnect.in',
        password: 'password123'
      },
      {
        role: 'buyer',
        label: 'Demo Buyer (FreshMart Supermarket)',
        email: 'buyer@kisanconnect.in',
        password: 'password123'
      },
      {
        role: 'admin',
        label: 'Demo Admin (MoCA & FPD Ministry)',
        email: 'admin@kisanconnect.in',
        password: 'password123'
      }
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route '${req.originalUrl}' not found`
  });
});

// Global Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5001;

// Start server
const startServer = async () => {
  try {
    // Seed initial data if empty
    await seedDB();
    
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🌾 KisanConnect Backend (Supabase) running on http://localhost:${PORT}`);
      console.log(`🌾 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();
