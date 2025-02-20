const Doctor = require('../models/doctorModel');
const Organization = require('../models/organizationModel');
const MediloungeUser = require('../models/userModel');

// Get all doctors
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'email displayName profilePhoto');
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Error fetching doctors' });
    }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.params.id })
            .populate('userId', 'email displayName profilePhoto');
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        res.json(doctor);
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({ message: 'Error fetching doctor details' });
    }
};

// Get all organizations
const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find()
            .populate('userId', 'email displayName profilePhoto');
        res.json(organizations);
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ message: 'Error fetching organizations' });
    }
};

// Get organization by ID
const getOrganizationById = async (req, res) => {
    try {
        const organization = await Organization.findOne({ userId: req.params.id })
            .populate('userId', 'email displayName profilePhoto');
        
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        
        res.json(organization);
    } catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({ message: 'Error fetching organization details' });
    }
};

// Get organization projects
const getOrganizationProjects = async (req, res) => {
    try {
        const organization = await Organization.findOne({ userId: req.params.id });
        
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        
        res.json(organization.projects);
    } catch (error) {
        console.error('Error fetching organization projects:', error);
        res.status(500).json({ message: 'Error fetching organization projects' });
    }
};

// Update doctor status
const updateDoctorStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        res.json(doctor);
    } catch (error) {
        console.error('Error updating doctor status:', error);
        res.status(500).json({ message: 'Error updating doctor status' });
    }
};

// Update organization status
const updateOrganizationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const organization = await Organization.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        
        res.json(organization);
    } catch (error) {
        console.error('Error updating organization status:', error);
        res.status(500).json({ message: 'Error updating organization status' });
    }
};

module.exports = {
    getAllDoctors,
    getDoctorById,
    getAllOrganizations,
    getOrganizationById,
    getOrganizationProjects,
    updateDoctorStatus,
    updateOrganizationStatus
};