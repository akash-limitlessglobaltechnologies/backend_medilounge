const Doctor = require('../models/doctorModel');

// Create doctor profile
const createProfile = async (req, res) => {
    try {
        const { info } = req.body;

        // Check if user already has a profile
        const existingProfile = await Doctor.findOne({ userId: req.user.id });
        if (existingProfile) {
            return res.status(400).json({
                message: 'Doctor profile already exists',
                success: false
            });
        }

        // If license number is provided, check for duplicates
        if (info.licenseNumber) {
            const existingDoctor = await Doctor.findOne({
                'info.licenseNumber': info.licenseNumber
            });

            if (existingDoctor) {
                return res.status(400).json({
                    message: 'License number already registered',
                    success: false
                });
            }
        }

        // Create doctor profile with data validation
        const doctorData = {
            userId: req.user.id,
            info: {
                ...info,
                dateOfBirth: new Date(info.dateOfBirth),
                experience: Number(info.experience),
                consultationFee: Number(info.consultationFee),
                qualifications: Array.isArray(info.qualifications) ? info.qualifications : [],
                expertise: Array.isArray(info.expertise) ? info.expertise : [],
                languages: Array.isArray(info.languages) ? info.languages : [],
                availableDays: Array.isArray(info.availableDays) ? info.availableDays : [],
                timeSlots: Array.isArray(info.timeSlots) ? info.timeSlots : [],
                portfolioItems: Array.isArray(info.portfolioItems) ? info.portfolioItems : []
            }
        };

        const doctor = new Doctor(doctorData);
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

        // If license number is being updated, check for duplicates
        if (info.licenseNumber) {
            const existingDoctor = await Doctor.findOne({
                userId: { $ne: req.user.id },
                'info.licenseNumber': info.licenseNumber
            });

            if (existingDoctor) {
                return res.status(400).json({
                    message: 'License number already registered',
                    success: false
                });
            }
        }

        // Prepare update data with proper type conversion
        const updateData = {
            ...info,
            dateOfBirth: info.dateOfBirth ? new Date(info.dateOfBirth) : undefined,
            experience: info.experience ? Number(info.experience) : undefined,
            consultationFee: info.consultationFee ? Number(info.consultationFee) : undefined
        };

        const doctor = await Doctor.findOneAndUpdate(
            { userId: req.user.id },
            { $set: { info: updateData } },
            { new: true, runValidators: true }
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

// Get doctor list with optional filtering
const getDoctorList = async (req, res) => {
    try {
        const { specialization, experience, languages } = req.query;
        let query = {};

        // Add filters if provided
        if (specialization) {
            query['info.specialization'] = specialization;
        }
        if (experience) {
            query['info.experience'] = { $gte: Number(experience) };
        }
        if (languages) {
            query['info.languages'] = { $in: languages.split(',') };
        }

        const doctors = await Doctor.find(query)
            .populate('userId', 'displayName email profilePhoto')
            .select('-info.licenseNumber'); // Exclude sensitive information

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

// Delete doctor profile
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

// Get doctor profile
const getProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id })
            .populate('userId', 'displayName email profilePhoto');
        
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

// Get doctor profile by ID (for public viewing)
const getProfileById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('userId', 'displayName email profilePhoto')
            .select('-info.licenseNumber'); // Exclude sensitive information
        
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
    getProfile,
    getProfileById
};