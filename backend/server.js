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
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// 6. Handle SPA Routing (Optional)
// Ensures that if a user refreshes a sub-page, it serves index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
}, (error, req, res, next) => {
    // This error handler prevents the PathError from crashing the app
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Certificates being served from: ${certPath}`);
});