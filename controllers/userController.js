const MediloungeUser = require('../models/userModel');
const { generateToken } = require('../utils/generateToken');

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await MediloungeUser.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found',
                success: false 
            });
        }
        
        const token = generateToken(user);
        res.status(200).json({ 
            user, 
            token,
            success: true 
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ 
            message: 'Server error',
            success: false,
            error: error.message 
        });
    }
};

// Get current user details
const getCurrentUser = async (req, res) => {
    try {
        const user = await MediloungeUser.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found',
                success: false 
            });
        }
        
        const token = generateToken(user);
        res.status(200).json({
            user,
            token,
            success: true,
            redirect: user.role === null ? '/register' :
                      user.role === 'doctor' ? '/doctor' :
                      user.role === 'organization' ? '/organization' : '/'
        });
    } catch (error) {
        console.error('Current user fetch error:', error);
        res.status(500).json({ 
            message: 'Server error',
            success: false,
            error: error.message 
        });
    }
};

// Complete user registration with role
const completeRegistration = async (req, res) => {
    try {
        const { role, name } = req.body;
        
        if (!['doctor', 'organization'].includes(role)) {
            return res.status(400).json({ 
                message: 'Invalid role',
                success: false 
            });
        }

        const existingUser = await MediloungeUser.findById(req.user.id);
        if (!existingUser) {
            return res.status(404).json({ 
                message: 'User not found',
                success: false 
            });
        }

        if (existingUser.role) {
            return res.status(400).json({ 
                message: 'User already registered',
                success: false 
            });
        }

        const updatedUser = await MediloungeUser.findByIdAndUpdate(
            req.user.id,
            { role, displayName: name },
            { new: true }
        );

        const token = generateToken(updatedUser);
        res.status(200).json({ 
            user: updatedUser, 
            token,
            success: true,
            redirect: role === 'doctor' ? '/doctor' : '/organization'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Error completing registration',
            success: false,
            error: error.message 
        });
    }
};

// Delete user account
const deleteAccount = async (req, res) => {
    try {
        const userExists = await MediloungeUser.findById(req.user.id);
        if (!userExists) {
            return res.status(404).json({ 
                message: 'User not found',
                success: false 
            });
        }

        await MediloungeUser.findByIdAndDelete(req.user.id);

        req.logout((err) => {
            if (err) {
                return res.status(500).json({ 
                    message: 'Error in logout process',
                    success: false 
                });
            }
            res.clearCookie('jwt');
            res.status(200).json({ 
                message: 'Account deleted successfully',
                success: true 
            });
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ 
            message: 'Error deleting account',
            success: false,
            error: error.message 
        });
    }
};

// Logout user
const logout = async (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ 
                    message: 'Error logging out',
                    success: false 
                });
            }
            res.clearCookie('jwt');
            res.status(200).json({ 
                message: 'Logged out successfully',
                success: true 
            });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            message: 'Error logging out',
            success: false,
            error: error.message 
        });
    }
};

module.exports = {
    getProfile,
    getCurrentUser,
    completeRegistration,
    deleteAccount,
    logout
};