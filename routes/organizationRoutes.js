const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../utils/generateToken');
const {
    getProfile,
    getProjects,
    createProfile,
    editProfile,
    addProject,
    editOrDeleteProject,
    deleteProfile
} = require('../controllers/organizationController');

// Organization routes
router.get('/profile', authMiddleware, getProfile);
router.post('/profile', authMiddleware, createProfile);
router.put('/profile', authMiddleware, editProfile);
router.delete('/profile', authMiddleware, deleteProfile);
router.get('/projects', authMiddleware, getProjects);
router.post('/project', authMiddleware, addProject);
router.put('/project/:projectId', authMiddleware, editOrDeleteProject);

module.exports = router;