const Doctor = require('../models/doctorModel');
const Organization = require('../models/organizationModel');

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

// Get doctor assignments
const getDoctorAssignments = async (req, res) => {
    try {
        const doctorEmail = req.user.email; // Get doctor's email from authenticated user

        const assignments = await Organization.aggregate([
            // Unwind projects array
            { $unwind: '$projects' },
            // Unwind links array
            { $unwind: '$projects.links' },
            // Match links assigned to the doctor
            {
                $match: {
                    'projects.links.assignedDoctor.doctorEmail': doctorEmail
                }
            },
            // Group by project and collect relevant links
            {
                $group: {
                    _id: '$projects._id',
                    organizationName: { $first: '$name' },
                    projectName: { $first: '$projects.name' },
                    projectDescription: { $first: '$projects.description' },
                    projectKey: { $first: '$projects.projectKey' },
                    links: {
                        $push: {
                            _id: '$projects.links._id',
                            title: '$projects.links.title',
                            url: '$projects.links.url',
                            status: '$projects.links.assignedDoctor.status',
                            notes: '$projects.links.assignedDoctor.notes',
                            assignedDate: '$projects.links.assignedDoctor.assignedDate',
                            completionDate: '$projects.links.assignedDoctor.completionDate'
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            assignments
        });
    } catch (error) {
        console.error('Error fetching doctor assignments:', error);
        res.status(500).json({ 
            message: 'Error fetching assignments',
            success: false,
            error: error.message 
        });
    }
};

// Save draft assignment notes
const saveDraftAssignment = async (req, res) => {
    try {
        const { projectId, linkId, notes } = req.body;
        const doctorEmail = req.user.email; // Get doctor's email from authenticated user

        // Find the organization with the matching project and link assigned to this doctor
        const organization = await Organization.findOne({
            'projects._id': projectId,
            'projects.links._id': linkId,
            'projects.links.assignedDoctor.doctorEmail': doctorEmail
        });

        if (!organization) {
            return res.status(404).json({ 
                message: 'Assignment not found or unauthorized',
                success: false 
            });
        }

        // Find the project and link
        const project = organization.projects.id(projectId);
        if (!project) {
            return res.status(404).json({ 
                message: 'Project not found',
                success: false 
            });
        }

        const link = project.links.id(linkId);
        if (!link || link.assignedDoctor.doctorEmail !== doctorEmail) {
            return res.status(403).json({ 
                message: 'Unauthorized to update this assignment',
                success: false 
            });
        }

        // Update notes
        link.assignedDoctor.notes = notes;
        await organization.save();

        res.status(200).json({
            message: 'Notes saved successfully',
            success: true,
            data: {
                projectId,
                linkId,
                notes
            }
        });
    } catch (error) {
        console.error('Error saving assignment notes:', error);
        res.status(500).json({ 
            message: 'Error saving notes',
            success: false,
            error: error.message 
        });
    }
};

// Complete assignment
const completeAssignment = async (req, res) => {
    try {
        const { projectId, linkId, notes } = req.body;
        const doctorEmail = req.user.email; // Get doctor's email from authenticated user

        // Find the organization with the matching project and link assigned to this doctor
        const organization = await Organization.findOne({
            'projects._id': projectId,
            'projects.links._id': linkId,
            'projects.links.assignedDoctor.doctorEmail': doctorEmail
        });

        if (!organization) {
            return res.status(404).json({ 
                message: 'Assignment not found or unauthorized',
                success: false 
            });
        }

        // Find the project and link
        const project = organization.projects.id(projectId);
        if (!project) {
            return res.status(404).json({ 
                message: 'Project not found',
                success: false 
            });
        }

        const link = project.links.id(linkId);
        if (!link || link.assignedDoctor.doctorEmail !== doctorEmail) {
            return res.status(403).json({ 
                message: 'Unauthorized to update this assignment',
                success: false 
            });
        }

        // Update status, notes, and completion date
        link.assignedDoctor.status = 'completed';
        link.assignedDoctor.notes = notes;
        link.assignedDoctor.completionDate = new Date();
        
        await organization.save();

        res.status(200).json({
            message: 'Assignment completed successfully',
            success: true,
            data: {
                projectId,
                linkId,
                status: 'completed',
                notes,
                completionDate: link.assignedDoctor.completionDate
            }
        });
    } catch (error) {
        console.error('Error completing assignment:', error);
        res.status(500).json({ 
            message: 'Error completing assignment',
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
    getProfileById,
    getDoctorAssignments,
    saveDraftAssignment,
    completeAssignment
};