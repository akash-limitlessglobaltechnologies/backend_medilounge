require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const annotationRoutes = require('./routes/annotationRoutes');
const aiCompanyRoutes = require('./routes/aiCompanyRoutes');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));

// Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // Always true for Vercel
        sameSite: 'none', // Required for cross-domain
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Root route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the API akash' });
});

// Add this route temporarily to debug
app.get('/debug-env', (req, res) => {
    res.json({
        backendUrl: process.env.BACKEND_URL,
        frontendUrl: process.env.FRONTEND_URL,
        nodeEnv: process.env.NODE_ENV
    });
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes); // Admin routes without role check
app.use('/organization', organizationRoutes);
app.use('/doctor', doctorRoutes);
app.use('/aicompany', aiCompanyRoutes);
app.use('/api/annotations', annotationRoutes);

// Error handling middleware
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// For Vercel, we need to export the app
module.exports = app;

// Start server only if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}