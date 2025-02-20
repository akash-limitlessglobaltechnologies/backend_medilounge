const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/generateToken');
const {
    createProfile,
    editProfile,
    getDoctorList,
    deleteProfile,
    getProfile    // Add this
} = require('../controllers/doctorController');

// Doctor routes
router.get('/profile', authMiddleware, getProfile);     // Add this
router.post('/profile', authMiddleware, createProfile);
router.put('/profile', authMiddleware, editProfile);
router.get('/list', getDoctorList);
router.delete('/profile', authMiddleware, deleteProfile);

module.exports = router;