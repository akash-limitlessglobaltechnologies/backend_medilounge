const mongoose = require('mongoose');

const qualificationSchema = new mongoose.Schema({
    degree: {
        type: String,
        required: true
    },
    institution: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    }
});

const expertiseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }
});

const portfolioItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    link: String
});

const timeSlotSchema = new mongoose.Schema({
    startTime: String,
    endTime: String
});

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MediloungeUser',
        required: true,
        unique: true
    },
    info: {
        // Personal Information
        fullName: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            required: true,
            enum: ['Male', 'Female', 'Other']
        },
        contactNumber: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },

        // Professional Information
        specialization: {
            type: String,
            required: true
        },
        licenseNumber: {
            type: String,
            required: true,
            unique: true
        },
        experience: {
            type: Number,
            required: true
        },
        qualifications: [qualificationSchema],

        // Expertise & Skills
        expertise: [expertiseSchema],

        // Pricing & Availability
        consultationFee: {
            type: Number,
            required: true
        },
        availableDays: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }],
        timeSlots: [timeSlotSchema],

        // Bio & Portfolio
        professionalBio: {
            type: String,
            required: true
        },
        portfolioItems: [portfolioItemSchema]
    }
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;