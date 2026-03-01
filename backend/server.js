const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();

// 1. Connect to Database
connectDB();

// 2. IMPORTANT: Manually import models here to register schemas before routes use them
require('./models/Student');
require('./models/Admin');
require('./models/Course');
require('./models/CertificateRequest');
require('./models/Certificate');
require('./models/Enrollment');
require('./models/Otp');

const app = express();

app.use(express.json());
app.use(cors());

// 3. Routes (Now safe to load because models are registered)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/certificate', require('./routes/certificateRoutes'));

// Serve static files for certificates
// server.js
const certPath = path.join(__dirname, 'public', 'certificates');
app.use('/certificates', express.static(certPath));

/**
 * Serving the Frontend
 * Since server.js is in /backend, we go one level up to reach /frontend.
 */
// backend/server.js

// 🟢 STEP 1: Serving the Frontend (Already in your code)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// 🟢 STEP 2: The Ultimate Catch-All (Replaces line 47)
// This uses a regular function instead of a regex string to avoid PathError
app.use((req, res, next) => {
    // If the request is for an API or Certificate, let it pass through
    if (req.url.startsWith('/api') || req.url.startsWith('/certificates')) {
        return next();
    }
    // For all other routes (like /login, /verify), serve index.html
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Final listen block (Already in your code)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});