const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/generateToken');
const {
    getProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    getApiKey,
    regenerateApiKey,
    configureIntegration,
    addImageAddress,
    getImageAddresses,
    deleteImageAddress
} = require('../controllers/aiCompanyController');

// AI company profile routes
router.get('/profile', authMiddleware, getProfile);
router.post('/profile', authMiddleware, createProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteProfile);

// API key management
router.get('/api-key', authMiddleware, getApiKey);
router.post('/api-key/regenerate', authMiddleware, regenerateApiKey);

// Integration configuration
router.post('/integration', authMiddleware, configureIntegration);

// Image address management
router.post('/image-address', authMiddleware, addImageAddress);
router.get('/image-addresses', authMiddleware, getImageAddresses);
router.delete('/image-address/:accessKey', authMiddleware, deleteImageAddress);

module.exports = router;