const mongoose = require('mongoose');

const aiCompanySchema = new mongoose.Schema({
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
    website: {
        type: String,
        required: true
    },
    apiKey: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended'],
        default: 'pending'
    },
    imageAddresses: [{
        imageUrl: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        accessKey: {
            type: String,
            required: true,
            unique: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    integrations: [{
        type: {
            type: String,
            enum: ['data_access', 'api', 'model_serving'],
        },
        status: {
            type: String,
            enum: ['pending', 'configured', 'active'],
            default: 'pending'
        },
        config: {
            type: mongoose.Schema.Types.Mixed
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Generate API key before saving if not exists
aiCompanySchema.pre('save', function(next) {
    if (!this.apiKey) {
        this.apiKey = generateApiKey();
    }
    next();
});

// Helper function to generate a random API key
function generateApiKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const prefix = 'med_ai_';
    let key = prefix;
    
    for (let i = 0; i < 24; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        key += characters.charAt(randomIndex);
    }
    
    return key;
}

// Helper function to generate a random 12-character access key
aiCompanySchema.statics.generateAccessKey = function() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    
    for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        key += characters.charAt(randomIndex);
    }
    
    return key;
};

const AICompany = mongoose.model('AICompany', aiCompanySchema);
module.exports = AICompany;