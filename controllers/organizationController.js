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

// Get all projects for the organization
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

// Get a specific project by ID
const getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const organization = await Organization.findOne({
            userId: req.user.id,
            'projects._id': projectId
        });

        if (!organization) {
            return res.status(404).json({
                message: 'Project not found',
                success: false
            });
        }

        // Find the specific project
        const project = organization.projects.id(projectId);
        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
                success: false
            });
        }

        res.status(200).json({
            project,
            success: true
        });
    } catch (error) {
        console.error('Get project by ID error:', error);
        res.status(500).json({
            message: 'Error fetching project details',
            success: false,
            error: error.message
        });
    }
};

// Create organization profile
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
// Add project with unique key generation
const addProject = async (req, res) => {
    try {
        console.log('Received project data:', req.body);

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

        // Generate unique project key
        let isUnique = false;
        let projectKey;
        
        while (!isUnique) {
            // Generate random 12-character alphanumeric key
            projectKey = generateRandomKey(12);
            
            // Check if key exists in any project
            const existingProject = await Organization.findOne({
                'projects.projectKey': projectKey
            });
            
            if (!existingProject) {
                isUnique = true;
            }
        }

        // Create new project with unique key
        const newProject = {
            name,
            description,
            links: links || [],  // Ensure links is at least an empty array
            projectKey
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
        console.error('Error adding project:', error);
        res.status(500).json({
            message: 'Error adding project',
            success: false,
            error: error.message
        });
    }
};

// Helper function to generate random alphanumeric string
const generateRandomKey = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    
    return result;
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

        // Update project fields
        if (updateData.name) organization.projects[projectIndex].name = updateData.name;
        if (updateData.description) organization.projects[projectIndex].description = updateData.description;
        
        // Update links if provided
        if (updateData.links && Array.isArray(updateData.links)) {
            // Validate links format
            if (!updateData.links.every(link => link.title && link.url)) {
                return res.status(400).json({
                    message: 'Invalid links format. Each link must have title and url',
                    success: false
                });
            }
            
            organization.projects[projectIndex].links = updateData.links;
        }

        await organization.save();

        res.status(200).json({
            project: organization.projects[projectIndex],
            success: true
        });
    } catch (error) {
        console.error('Error updating/deleting project:', error);
        res.status(500).json({
            message: 'Error updating/deleting project',
            success: false,
            error: error.message
        });
    }
};

// Delete organization profile
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

module.exports = {
    getProfile,
    getProjects,
    createProfile,
    editProfile,
    addProject,
    editOrDeleteProject,
    deleteProfile,
    getProjectById
};