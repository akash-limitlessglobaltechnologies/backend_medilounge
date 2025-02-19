const express = require('express');
const router = express.Router();
const {
    getProfile,
    getCurrentUser,
    completeRegistration,
    deleteAccount,
    logout
} = require('../controllers/userController');
const { authMiddleware } = require('../utils/generateToken');

// Debug middleware
router.use((req, res, next) => {
    console.log('API Route accessed:', req.path);
    next();
});

// Auth protected routes
router.get('/profile', authMiddleware, getProfile);
router.get('/current-user', authMiddleware, getCurrentUser);
router.post('/complete-registration', authMiddleware, completeRegistration);
router.delete('/delete-account', authMiddleware, deleteAccount);
router.get('/logout', authMiddleware, logout);

module.exports = router;