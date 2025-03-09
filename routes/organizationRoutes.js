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
    deleteProfile,
    getProjectById
} = require('../controllers/organizationController');

// Organization profile routes
router.get('/profile', authMiddleware, getProfile);
router.post('/profile', authMiddleware, createProfile);
router.put('/profile', authMiddleware, editProfile);
router.delete('/profile', authMiddleware, deleteProfile);

// Projects routes
router.get('/projects', authMiddleware, getProjects);
router.get('/project/:projectId', authMiddleware, getProjectById);
router.post('/project', authMiddleware, addProject);
router.put('/project/:projectId', authMiddleware, editOrDeleteProject);

module.exports = router;