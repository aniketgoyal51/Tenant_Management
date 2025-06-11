const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = ['http://localhost:5173', 'https://tenant-management-4cut.onrender.com'];
        // console.log('Request origin:', origin);
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked for origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle preflight requests
app.options('*', cors(corsOptions));

// MongoDB Connection with optimized settings
// console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4 // Use IPv4, skip trying IPv6
})
    .then(() => {
        console.log('Successfully connected to MongoDB');
        console.log('MongoDB connection state:', mongoose.connection.readyState);
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit if cannot connect to database
    });

// Add a health check endpoint
app.get('/api/health', (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime()
    };
    res.status(200).json(health);
});

// Routes
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/units', require('./routes/unitRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    // console.log(`Server is running on port ${PORT}`);
    // console.log(`Server URL: http://localhost:${PORT}`);
    // console.log(`Health check URL: http://localhost:${PORT}/api/health`);
});

// Handle server errors
server.on('error', (error) => {
    // console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
    }
}); 