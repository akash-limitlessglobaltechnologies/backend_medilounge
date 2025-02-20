const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/generateToken');
const {
    getAllDoctors,
    getDoctorById,
    getAllOrganizations,
    getOrganizationById,
    getOrganizationProjects,
    updateDoctorStatus,
    updateOrganizationStatus
} = require('../controllers/adminController');

// Admin routes without role check
router.get('/doctors', authMiddleware, getAllDoctors);
router.get('/doctors/:id', authMiddleware, getDoctorById);
router.put('/doctors/:id/status', authMiddleware, updateDoctorStatus);

router.get('/organizations', authMiddleware, getAllOrganizations);
router.get('/organizations/:id', authMiddleware, getOrganizationById);
router.get('/organizations/:id/projects', authMiddleware, getOrganizationProjects);
router.put('/organizations/:id/status', authMiddleware, updateOrganizationStatus);

module.exports = router;