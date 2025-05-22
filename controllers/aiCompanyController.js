const AICompany = require('../models/aiCompanyModel');
const MediloungeUser = require('../models/userModel');
const { generateToken } = require('../utils/generateToken');

// Get AI company profile
const getProfile = async (req, res) => {
    try {
        console.log('Getting profile for AI company user ID:', req.user.id);
        
        const aiCompany = await AICompany.findOne({ 
            userId: req.user.id 
        });
        console.log('Found AI company:', aiCompany);

        if (!aiCompany) {
            return res.status(404).json({
                message: 'AI company not found',
                success: false
            });
        }

        res.status(200).json({
            aiCompany,
            success: true
        });
    } catch (error) {
        console.error('Get AI company profile error:', error);
        res.status(500).json({
            message: 'Error fetching profile',
            success: false,
            error: error.message
        });
    }
};

// Create AI company profile
const createProfile = async (req, res) => {
    try {
        const { name, website } = req.body;

        // Validate input
        if (!name || !website) {
            return res.status(400).json({
                message: 'Company name and website are required',
                success: false
            });
        }

        // Check if profile already exists
        const existingProfile = await AICompany.findOne({ userId: req.user.id });
        if (existingProfile) {
            return res.status(400).json({
                message: 'AI company profile already exists',
                success: false
            });
        }

        // Create AI company profile
        const aiCompany = new AICompany({
            userId: req.user.id,
            name,
            website
        });

        await aiCompany.save();

        // Update user role to 'aicompany'
        await MediloungeUser.findByIdAndUpdate(
            req.user.id,
            { role: 'aicompany' }
        );

        // Generate new token with updated role
        const updatedUser = await MediloungeUser.findById(req.user.id);
        const token = generateToken(updatedUser);

        res.status(201).json({
            aiCompany,
            token, // Include the new token
            success: true
        });
    } catch (error) {
        console.error('Create AI company profile error:', error);
        res.status(500).json({
            message: 'Error creating profile',
            success: false,
            error: error.message
        });
    }
};

// Update AI company profile
const updateProfile = async (req, res) => {
    try {
        const { name, website } = req.body;

        // Validate input
        if (!name && !website) {
            return res.status(400).json({
                message: 'At least one field to update is required',
                success: false
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (website) updateData.website = website;

        const aiCompany = await AICompany.findOneAndUpdate(
            { userId: req.user.id },
            updateData,
            { new: true }
        );

        if (!aiCompany) {
            return res.status(404).json({
                message: 'AI company not found',
                success: false
            });
        }

        res.status(200).json({
            aiCompany,
            success: true
        });
    } catch (error) {
        console.error('Update AI company profile error:', error);
        res.status(500).json({
            message: 'Error updating profile',
            success: false,
            error: error.message
        });
    }
};

// Delete AI company profile
const deleteProfile = async (req, res) => {
    try {
        const result = await AICompany.findOneAndDelete({ userId: req.user.id });

        if (!result) {
            return res.status(404).json({
                message: 'AI company not found',
                success: false
            });
        }

        res.status(200).json({
            message: 'AI company profile deleted successfully',
            success: true
        });
    } catch (error) {
        console.error('Delete AI company profile error:', error);
        res.status(500).json({
            message: 'Error deleting profile',
            success: false,
            error: error.message
        });
    }
};

// Get API key
const getApiKey = async (req, res) => {
    try {
        const aiCompany = await AICompany.findOne({ userId: req.user.id });

        if (!aiCompany) {
            return res.status(404).json({
                message: 'AI company not found',
                success: false
            });
        }

        res.status(200).json({
            apiKey: aiCompany.apiKey,
            success: true
        });
    } catch (error) {
        console.error('Get API key error:', error);
        res.status(500).json({
            message: 'Error fetching API key',
            success: false,
            error: error.message
        });
    }
};

// Regenerate API key
const regenerateApiKey = async (req, res) => {
    try {
        const aiCompany = await AICompany.findOne({ userId: req.user.id });

        if (!aiCompany) {
            return res.status(404).json({
                message: 'AI company not found',
                success: false
            });
        }

        // Generate new API key
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const prefix = 'med_ai_';
        let apiKey = prefix;
        
        for (let i = 0; i < 24; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            apiKey += characters.charAt(randomIndex);
        }

        aiCompany.apiKey = apiKey;
        await aiCompany.save();

        res.status(200).json({
            apiKey: aiCompany.apiKey,
            success: true
        });
    } catch (error) {
        console.error('Regenerate API key error:', error);
        res.status(500).json({
            message: 'Error regenerating API key',
            success: false,
            error: error.message
        });
    }
};

// Configure integration
const configureIntegration = async (req, res) => {
    try {
        const { type, config } = req.body;

        if (!type || !config) {
            return res.status(400).json({
                message: 'Integration type and configuration are required',
                success: false
            });
        }

        const aiCompany = await AICompany.findOne({ userId: req.user.id });

        if (!aiCompany) {
            return res.status(404).json({
                message: 'AI company not found',
                success: false
            });
        }

        // Check if integration of this type already exists
        const existingIntegrationIndex = aiCompany.integrations.findIndex(
            integration => integration.type === type
        );

        if (existingIntegrationIndex >= 0) {
            // Update existing integration
            aiCompany.integrations[existingIntegrationIndex].config = config;
            aiCompany.integrations[existingIntegrationIndex].status = 'configured';
        } else {
            // Add new integration
            aiCompany.integrations.push({
                type,
                status: 'configured',
                config
            });
        }

        await aiCompany.save();

        res.status(200).json({
            integration: aiCompany.integrations.find(integration => integration.type === type),
            success: true
        });
    } catch (error) {
        console.error('Configure integration error:', error);
        res.status(500).json({
            message: 'Error configuring integration',
            success: false,
            error: error.message
        });
    }
};

// Add image address with unique key
const addImageAddress = async (req, res) => {
    try {
        const { imageUrl, title } = req.body;

        // Validate input
        if (!imageUrl || !title) {
            return res.status(400).json({
                message: 'Image URL and title are required',
                success: false
            });
        }

        const aiCompany = await AICompany.findOne({ userId: req.user.id });

        if (!aiCompany) {
            return res.status(404).json({
                message: 'AI company not found',
                success: false
            });
        }

        // Generate a unique access key
        let accessKey;
        let isUnique = false;

        // Keep generating keys until we find a unique one
        while (!isUnique) {
            accessKey = AICompany.schema.statics.generateAccessKey();
            
            // Check if this key already exists in any company's imageAddresses
            const existingKey = await AICompany.findOne({
                'imageAddresses.accessKey': accessKey
            });
            
            if (!existingKey) {
                isUnique = true;
            }
        }

        // Add the new image address
        const newImageAddress = {
            imageUrl,
            title,
            accessKey
        };

        aiCompany.imageAddresses.push(newImageAddress);
        await aiCompany.save();

        res.status(201).json({
            imageAddress: newImageAddress,
            success: true
        });
    } catch (error) {
        console.error('Add image address error:', error);
        res.status(500).json({
            message: 'Error adding image address',
            success: false,
            error: error.message
        });
    }
};

// Get all image addresses
const getImageAddresses = async (req, res) => {
    try {
        const aiCompany = await AICompany.findOne({ userId: req.user.id });

        if (!aiCompany) {
            return res.status(404).json({
                message: 'AI company not found',
                success: false
            });
        }

        res.status(200).json({
            imageAddresses: aiCompany.imageAddresses,
            success: true
        });
    } catch (error) {
        console.error('Get image addresses error:', error);
        res.status(500).json({
            message: 'Error fetching image addresses',
            success: false,
            error: error.message
        });
    }
};

// Delete image address
const deleteImageAddress = async (req, res) => {
    try {
        const { accessKey } = req.params;

        if (!accessKey) {
            return res.status(400).json({
                message: 'Access key is required',
                success: false
            });
        }

        const aiCompany = await AICompany.findOne({ userId: req.user.id });

        if (!aiCompany) {
            return res.status(404).json({
                message: 'AI company not found',
                success: false
            });
        }

        // Find and remove the image address with the matching access key
        const initialLength = aiCompany.imageAddresses.length;
        aiCompany.imageAddresses = aiCompany.imageAddresses.filter(img => img.accessKey !== accessKey);

        if (aiCompany.imageAddresses.length === initialLength) {
            return res.status(404).json({
                message: 'Image address not found',
                success: false
            });
        }

        await aiCompany.save();

        res.status(200).json({
            message: 'Image address deleted successfully',
            success: true
        });
    } catch (error) {
        console.error('Delete image address error:', error);
        res.status(500).json({
            message: 'Error deleting image address',
            success: false,
            error: error.message
        });
    }
};

module.exports = {
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
};