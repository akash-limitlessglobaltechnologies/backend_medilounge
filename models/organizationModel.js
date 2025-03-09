const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    assignedDoctor: {
        doctorEmail: String,
        status: {
            type: String,
            enum: ['pending', 'assigned', 'completed'],
            default: 'pending'
        },
        assignedDate: {
            type: Date
        },
        completionDate: {
            type: Date
        },
        notes: String
    }
});

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    projectKey: {
        type: String,
        unique: true
    },
    links: [linkSchema],
    assignedDoctor: {
        doctorEmail: String,
        status: {
            type: String,
            enum: ['pending', 'assigned', 'completed'],
            default: 'pending'
        },
        assignedDate: {
            type: Date
        },
        completionDate: {
            type: Date
        },
        notes: String
    }
});

const organizationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MediloungeUser',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    numberOfEmployees: {
        type: Number,
        required: true
    },
    projects: [projectSchema]
}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);
module.exports = Organization;