const Organization = require('../models/organizationModel');

// Fetch organization profile
const getProfile = async (req, res) => {
    try {
        console.log('Getting profile for user ID:', req.user.id);
        
        const organization = await Organization.findOne({ 
            userId: req.user.id 
        });
        console.log('Found organization:', organization);

        if (!organization) {
            return res.status(404).json({
                message: 'Organization not found',
                success: false
            });
        }

        res.status(200).json({
            organization,
            success: true
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            message: 'Error fetching profile',
            success: false,
            error: error.message
        });
    }
};

const getProjects = async (req, res) => {
    try {
        console.log('Getting projects for user ID:', req.user.id);
        
        const organization = await Organization.findOne({ 
            userId: req.user.id 
        });
        console.log('Found organization for projects:', organization);

        if (!organization) {
            return res.status(404).json({
                message: 'Organization not found',
                success: false
            });
        }

        res.status(200).json({
            projects: organization.projects || [],
            success: true
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            message: 'Error fetching projects',
            success: false,
            error: error.message
        });
    }
};

// Upload/Create organization profile
const createProfile = async (req, res) => {
    try {
        const { name, contactNumber, numberOfEmployees } = req.body;

        const organization = new Organization({
            userId: req.user.id,
            name,
            contactNumber,
            numberOfEmployees
        });

        await organization.save();

        res.status(201).json({
            organization,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating profile',
            success: false,
            error: error.message
        });
    }
};

// Edit organization profile
const editProfile = async (req, res) => {
    try {
        const { name, contactNumber, numberOfEmployees } = req.body;

        const organization = await Organization.findOneAndUpdate(
            { userId: req.user.id },
            { name, contactNumber, numberOfEmployees },
            { new: true }
        );

        if (!organization) {
            return res.status(404).json({
                message: 'Organization not found',
                success: false
            });
        }

        res.status(200).json({
            organization,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating profile',
            success: false,
            error: error.message
        });
    }
};

// Add project
const addProject = async (req, res) => {
    try {
        console.log('Received project data:', req.body); // Add logging

        const { name, description, links } = req.body;

        // Validate input
        if (!name || !description) {
            return res.status(400).json({
                message: 'Name and description are required',
                success: false
            });
        }

        // Validate links format
        if (links && (!Array.isArray(links) || !links.every(link => link.title && link.url))) {
            return res.status(400).json({
                message: 'Invalid links format. Each link must have title and url',
                success: false
            });
        }

        const organization = await Organization.findOne({ userId: req.user.id });
        if (!organization) {
            return res.status(404).json({
                message: 'Organization not found',
                success: false
            });
        }

        // Create new project
        const newProject = {
            name,
            description,
            links: links || []  // Ensure links is at least an empty array
        };

        organization.projects.push(newProject);
        await organization.save();

        // Get the newly added project
        const addedProject = organization.projects[organization.projects.length - 1];

        res.status(201).json({
            project: addedProject,
            success: true
        });
    } catch (error) {
        console.error('Error adding project:', error); // Add error logging
        res.status(500).json({
            message: 'Error adding project',
            success: false,
            error: error.message
        });
    }
};

// Edit or delete project
const editOrDeleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { action, ...updateData } = req.body;

        const organization = await Organization.findOne({ userId: req.user.id });
        if (!organization) {
            return res.status(404).json({
                message: 'Organization not found',
                success: false
            });
        }

        if (action === 'delete') {
            organization.projects = organization.projects.filter(
                project => project._id.toString() !== projectId
            );
            await organization.save();
            return res.status(200).json({
                message: 'Project deleted successfully',
                success: true
            });
        }

        // Edit project
        const projectIndex = organization.projects.findIndex(
            project => project._id.toString() === projectId
        );

        if (projectIndex === -1) {
            return res.status(404).json({
                message: 'Project not found',
                success: false
            });
        }

        organization.projects[projectIndex] = {
            ...organization.projects[projectIndex].toObject(),
            ...updateData
        };

        await organization.save();

        res.status(200).json({
            project: organization.projects[projectIndex],
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating/deleting project',
            success: false,
            error: error.message
        });
    }
};


// Add to organizationController.js
const deleteProfile = async (req, res) => {
    try {
        // First find the organization
        const organization = await Organization.findOne({ userId: req.user.id });
        
        if (!organization) {
            return res.status(404).json({
                message: 'Organization not found',
                success: false
            });
        }

        // Clear all projects
        organization.projects = [];
        await organization.save();

        // Then delete the organization profile
        await Organization.findOneAndDelete({ userId: req.user.id });

        res.status(200).json({
            message: 'Organization profile deleted successfully',
            success: true
        });
    } catch (error) {
        console.error('Error deleting organization:', error);
        res.status(500).json({
            message: 'Error deleting organization profile',
            success: false,
            error: error.message
        });
    }
};

// Add to exports
module.exports = {
    getProfile,
    getProjects,
    createProfile,
    editProfile,
    addProject,
    editOrDeleteProject,
    deleteProfile  // Add this
};