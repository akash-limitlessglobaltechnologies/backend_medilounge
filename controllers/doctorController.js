const Doctor = require('../models/doctorModel');

// Create doctor profile
// In doctorController.js
const createProfile = async (req, res) => {
    try {
        const { info } = req.body;

        // Validate required fields
        if (!info || !info.licenseNumber) {
            return res.status(400).json({
                message: 'License number is required',
                success: false
            });
        }

        // Check if license number already exists
        const existingDoctor = await Doctor.findOne({
            'info.licenseNumber': info.licenseNumber
        });

        if (existingDoctor) {
            return res.status(400).json({
                message: 'License number already registered',
                success: false
            });
        }

        const doctor = new Doctor({
            userId: req.user.id,
            info
        });

        await doctor.save();

        res.status(201).json({
            doctor,
            success: true
        });
    } catch (error) {
        console.error('Server error details:', error);
        res.status(500).json({
            message: 'Error creating doctor profile',
            success: false,
            error: error.message
        });
    }
};

// Edit doctor profile
const editProfile = async (req, res) => {
    try {
        const { info } = req.body;

        const doctor = await Doctor.findOneAndUpdate(
            { userId: req.user.id },
            { info },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({
                message: 'Doctor profile not found',
                success: false
            });
        }

        res.status(200).json({
            doctor,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating doctor profile',
            success: false,
            error: error.message
        });
    }
};

// Get doctor list
const getDoctorList = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'displayName email profilePhoto'); // Add any other fields you want to populate

        res.status(200).json({
            doctors,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching doctor list',
            success: false,
            error: error.message
        });
    }


    
};


const deleteProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOneAndDelete({ userId: req.user.id });

        if (!doctor) {
            return res.status(404).json({
                message: 'Doctor profile not found',
                success: false
            });
        }

        res.status(200).json({
            message: 'Doctor profile deleted successfully',
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting doctor profile',
            success: false,
            error: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        
        if (!doctor) {
            return res.status(404).json({
                message: 'Doctor profile not found',
                success: false
            });
        }

        res.status(200).json({
            doctor,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching doctor profile',
            success: false,
            error: error.message
        });
    }
};



module.exports = {
    createProfile,
    editProfile,
    getDoctorList,
    deleteProfile,
    getProfile
};