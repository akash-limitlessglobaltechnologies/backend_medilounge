const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/generateToken');
const {
    createProfile,
    editProfile,
    getDoctorList,
    deleteProfile,
    getProfile,
    getProfileById,
    getDoctorAssignments,
    saveDraftAssignment,
    completeAssignment
} = require('../controllers/doctorController');

// Doctor profile routes
router.get('/profile', authMiddleware, getProfile);
router.post('/profile', authMiddleware, createProfile);
router.put('/profile', authMiddleware, editProfile);
router.get('/list', getDoctorList);
router.get('/profile/:id', getProfileById);
router.delete('/profile', authMiddleware, deleteProfile);

// Doctor assignments routes
router.get('/assignments', authMiddleware, getDoctorAssignments);
router.post('/assignments/save-draft', authMiddleware, saveDraftAssignment);
router.post('/assignments/complete', authMiddleware, completeAssignment);

module.exports = router;