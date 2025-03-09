const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/generateToken');
const {
    // Existing controller functions
    getAllDoctors,
    getDoctorById,
    getAllOrganizations,
    getOrganizationById,
    getOrganizationProjects,
    updateDoctorStatus,
    updateOrganizationStatus,
    
    // New controller functions for project/link assignment
    assignProjectToDoctor,
    assignLinkToDoctor,
    updateAssignmentStatus,
    deassignFromDoctor,
    getDoctorAssignments
} = require('../controllers/adminController');


router.get('/doctors', authMiddleware, getAllDoctors);
router.get('/doctors/:id', authMiddleware, getDoctorById);
router.put('/doctors/:id/status', authMiddleware, updateDoctorStatus);

router.get('/organizations', authMiddleware, getAllOrganizations);
router.get('/organizations/:id', authMiddleware, getOrganizationById);
router.get('/organizations/:id/projects', authMiddleware, getOrganizationProjects);
router.put('/organizations/:id/status', authMiddleware, updateOrganizationStatus);
router.post('/assignments/project', authMiddleware, assignProjectToDoctor);
router.post('/assignments/links', authMiddleware, assignLinkToDoctor);
router.put('/assignments/status', authMiddleware, updateAssignmentStatus);
router.delete('/assignments', authMiddleware, deassignFromDoctor);
router.get('/assignments/doctor/:doctorEmail', authMiddleware, getDoctorAssignments);

module.exports = router;