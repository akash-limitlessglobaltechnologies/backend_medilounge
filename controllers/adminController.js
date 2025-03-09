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
        console.log()
        res.json(organization);
    } catch (error) {
        console.error('Error updating organization status:', error);
        res.status(500).json({ message: 'Error updating organization status' });
    }
};

const assignProjectToDoctor = async (req, res) => {
    try {
        const { projectId, doctorEmail, notes } = req.body;

        // Verify doctor exists
        const doctor = await MediloungeUser.findOne({ 
            email: doctorEmail,
            role: 'doctor'
        });
        
        if (!doctor) {
            return res.status(404).json({ 
                message: 'Doctor not found with this email',
                success: false 
            });
        }

        // Find and update the project
        const organization = await Organization.findOne({
            'projects._id': projectId
        });

        if (!organization) {
            return res.status(404).json({ 
                message: 'Project not found',
                success: false 
            });
        }

        const project = organization.projects.id(projectId);
        if (project.assignedDoctor && project.assignedDoctor.doctorEmail) {
            return res.status(400).json({ 
                message: 'Project is already assigned to a doctor',
                success: false 
            });
        }

        project.assignedDoctor = {
            doctorEmail,
            status: 'assigned',
            assignedDate: new Date(),
            notes
        };

        await organization.save();

        res.status(200).json({
            message: 'Project assigned successfully',
            success: true,
            project
        });
    } catch (error) {
        console.error('Error assigning project:', error);
        res.status(500).json({ 
            message: 'Error assigning project',
            success: false,
            error: error.message 
        });
    }
};

// const assignLinkToDoctor = async (req, res) => {
//     try {
//         const { projectId, linkId, doctorEmail, notes } = req.body;

//         // Verify doctor exists
//         const doctor = await MediloungeUser.findOne({ 
//             email: doctorEmail,
//             role: 'doctor'
//         });
        
//         if (!doctor) {
//             return res.status(404).json({ 
//                 message: 'Doctor not found with this email',
//                 success: false 
//             });
//         }

//         // Find and update the link
//         const organization = await Organization.findOne({
//             'projects._id': projectId
//         });

//         if (!organization) {
//             return res.status(404).json({ 
//                 message: 'Project not found',
//                 success: false 
//             });
//         }

//         const project = organization.projects.id(projectId);
//         if (!project) {
//             return res.status(404).json({ 
//                 message: 'Project not found',
//                 success: false 
//             });
//         }

//         const link = project.links.id(linkId);
//         if (!link) {
//             return res.status(404).json({ 
//                 message: 'Link not found',
//                 success: false 
//             });
//         }

//         if (link.assignedDoctor && link.assignedDoctor.doctorEmail) {
//             return res.status(400).json({ 
//                 message: 'Link is already assigned to a doctor',
//                 success: false 
//             });
//         }

//         link.assignedDoctor = {
//             doctorEmail,
//             status: 'assigned',
//             assignedDate: new Date(),
//             notes
//         };

//         await organization.save();

//         res.status(200).json({
//             message: 'Link assigned successfully',
//             success: true,
//             link
//         });
//     } catch (error) {
//         console.error('Error assigning link:', error);
//         res.status(500).json({ 
//             message: 'Error assigning link',
//             success: false,
//             error: error.message 
//         });
//     }
// };

// const updateAssignmentStatus = async (req, res) => {
//     try {
//         const { projectId, linkId, status } = req.body;

//         if (!['pending', 'assigned', 'completed'].includes(status)) {
//             return res.status(400).json({ 
//                 message: 'Invalid status',
//                 success: false 
//             });
//         }

//         const organization = await Organization.findOne({
//             'projects._id': projectId
//         });

//         if (!organization) {
//             return res.status(404).json({ 
//                 message: 'Project not found',
//                 success: false 
//             });
//         }

//         const project = organization.projects.id(projectId);
//         if (!project) {
//             return res.status(404).json({ 
//                 message: 'Project not found',
//                 success: false 
//             });
//         }

//         if (linkId) {
//             const link = project.links.id(linkId);
//             if (!link) {
//                 return res.status(404).json({ 
//                     message: 'Link not found',
//                     success: false 
//                 });
//             }

//             link.assignedDoctor.status = status;
//             if (status === 'completed') {
//                 link.assignedDoctor.completionDate = new Date();
//             }
//         } else {
//             project.assignedDoctor.status = status;
//             if (status === 'completed') {
//                 project.assignedDoctor.completionDate = new Date();
//             }
//         }

//         await organization.save();

//         res.status(200).json({
//             message: 'Status updated successfully',
//             success: true,
//             data: linkId ? project.links.id(linkId) : project
//         });
//     } catch (error) {
//         console.error('Error updating status:', error);
//         res.status(500).json({ 
//             message: 'Error updating status',
//             success: false,
//             error: error.message 
//         });
//     }
// };

const deassignFromDoctor = async (req, res) => {
    try {
        const { projectId, linkId } = req.body;

        const organization = await Organization.findOne({
            'projects._id': projectId
        });

        if (!organization) {
            return res.status(404).json({ 
                message: 'Project not found',
                success: false 
            });
        }

        const project = organization.projects.id(projectId);
        if (!project) {
            return res.status(404).json({ 
                message: 'Project not found',
                success: false 
            });
        }

        if (linkId) {
            const link = project.links.id(linkId);
            if (!link) {
                return res.status(404).json({ 
                    message: 'Link not found',
                    success: false 
                });
            }
            link.assignedDoctor = undefined;
        } else {
            project.assignedDoctor = undefined;
        }

        await organization.save();

        res.status(200).json({
            message: 'Assignment removed successfully',
            success: true
        });
    } catch (error) {
        console.error('Error removing assignment:', error);
        res.status(500).json({ 
            message: 'Error removing assignment',
            success: false,
            error: error.message 
        });
    }
};

// const getDoctorAssignments = async (req, res) => {
//     try {
//         const { doctorEmail } = req.params;

//         const assignments = await Organization.aggregate([
//             // Unwind projects array
//             { $unwind: '$projects' },
//             // Match projects assigned to the doctor
//             {
//                 $match: {
//                     $or: [
//                         { 'projects.assignedDoctor.doctorEmail': doctorEmail },
//                         { 'projects.links.assignedDoctor.doctorEmail': doctorEmail }
//                     ]
//                 }
//             },
//             // Project only relevant fields
//             {
//                 $project: {
//                     projectName: '$projects.name',
//                     projectId: '$projects._id',
//                     projectAssignment: '$projects.assignedDoctor',
//                     links: {
//                         $filter: {
//                             input: '$projects.links',
//                             as: 'link',
//                             cond: { $eq: ['$$link.assignedDoctor.doctorEmail', doctorEmail] }
//                         }
//                     }
//                 }
//             }
//         ]);

//         res.status(200).json({
//             success: true,
//             assignments
//         });
//     } catch (error) {
//         console.error('Error fetching assignments:', error);
//         res.status(500).json({ 
//             message: 'Error fetching assignments',
//             success: false,
//             error: error.message 
//         });
//     }
// };
const assignLinkToDoctor = async (req, res) => {
    try {
        const { projectId, linkIds, doctorEmail } = req.body;

        // Validate input
        if (!Array.isArray(linkIds) || linkIds.length === 0) {
            return res.status(400).json({
                message: 'No links selected for assignment',
                success: false
            });
        }

        // Verify doctor exists
        const doctor = await MediloungeUser.findOne({ 
            email: doctorEmail,
            role: 'doctor'
        });
        
        if (!doctor) {
            return res.status(404).json({ 
                message: 'Doctor not found with this email',
                success: false 
            });
        }

        // Find organization and project
        const organization = await Organization.findOne({
            'projects._id': projectId
        });

        if (!organization) {
            return res.status(404).json({ 
                message: 'Project not found',
                success: false 
            });
        }

        const project = organization.projects.id(projectId);
        if (!project) {
            return res.status(404).json({ 
                message: 'Project not found',
                success: false 
            });
        }

        // Update each selected link
        let alreadyAssignedLinks = [];
        let assignedLinks = [];

        linkIds.forEach(linkId => {
            const link = project.links.id(linkId);
            if (!link) return;

            if (link.assignedDoctor && link.assignedDoctor.doctorEmail) {
                alreadyAssignedLinks.push(link.title);
            } else {
                link.assignedDoctor = {
                    doctorEmail,
                    status: 'assigned',
                    assignedDate: new Date()
                };
                assignedLinks.push(link.title);
            }
        });

        await organization.save();

        // Return appropriate response
        if (alreadyAssignedLinks.length > 0) {
            return res.status(200).json({
                message: `${assignedLinks.length} links assigned successfully. ${alreadyAssignedLinks.length} links were already assigned.`,
                success: true,
                assignedLinks,
                alreadyAssignedLinks
            });
        }

        res.status(200).json({
            message: 'All links assigned successfully',
            success: true,
            assignedLinks
        });

    } catch (error) {
        console.error('Error assigning links:', error);
        res.status(500).json({ 
            message: 'Error assigning links',
            success: false,
            error: error.message 
        });
    }
};

const updateAssignmentStatus = async (req, res) => {
    try {
        const { projectId, linkId, status } = req.body;
        const doctorEmail = req.user.email; // Get doctor's email from authenticated user

        if (!['completed'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status update request',
                success: false 
            });
        }

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

        const project = organization.projects.id(projectId);
        const link = project.links.id(linkId);

        if (!link || link.assignedDoctor.doctorEmail !== doctorEmail) {
            return res.status(403).json({ 
                message: 'Unauthorized to update this assignment',
                success: false 
            });
        }

        link.assignedDoctor.status = status;
        if (status === 'completed') {
            link.assignedDoctor.completionDate = new Date();
        }

        await organization.save();

        res.status(200).json({
            message: 'Assignment status updated successfully',
            success: true,
            data: link
        });
    } catch (error) {
        console.error('Error updating assignment status:', error);
        res.status(500).json({ 
            message: 'Error updating assignment status',
            success: false,
            error: error.message 
        });
    }
};

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
                    links: {
                        $push: {
                            _id: '$projects.links._id',
                            title: '$projects.links.title',
                            url: '$projects.links.url',
                            status: '$projects.links.assignedDoctor.status',
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


module.exports = {
    getAllDoctors,
    getDoctorById,
    getAllOrganizations,
    getOrganizationById,
    getOrganizationProjects,
    updateDoctorStatus,
    updateOrganizationStatus,
    assignProjectToDoctor,
    assignLinkToDoctor,
    updateAssignmentStatus,
    deassignFromDoctor,
    getDoctorAssignments
};