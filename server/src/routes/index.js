const express = require('express');
const authRoutes = require('./authRoutes');
const mechanicAuthRoutes = require('./mechanicAuthRoutes');
const jobRoutes = require('./jobRoutes');
const mechanicRoutes = require('./mechanicRoutes');
const userRoutes = require('./userRoutes');
const publicRoutes = require('./publicRoutes');
const partRoutes = require('./partRoutes');

const router = express.Router();

// ─── API Health Check ────────────────────────────────────────
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🔧 SusaLabs Repairing Shop API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            mechanicAuth: '/api/mechanic-auth',
            jobs: '/api/jobs',
            mechanics: '/api/mechanics',
            users: '/api/users',
            parts: '/api/parts',
        },
    });
});

// ─── Mount Routes ────────────────────────────────────────────
router.use('/auth', authRoutes);                   // Admin/Receptionist auth
router.use('/mechanic-auth', mechanicAuthRoutes);  // Mechanic auth (login, logout, refresh)
router.use('/jobs', jobRoutes);                    // Job management (admin only via protect)
router.use('/mechanics', mechanicRoutes);          // Mechanic CRUD (admin only)
router.use('/users', userRoutes);                  // User CRUD (admin only)
router.use('/public', publicRoutes);               // Public endpoints (no auth)
router.use('/parts', partRoutes);                  // Parts/Inventory (store & admin)

module.exports = router;
