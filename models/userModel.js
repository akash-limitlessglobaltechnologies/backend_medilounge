const mongoose = require('mongoose');

const mediloungeUserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: String,
  firstName: String,
  lastName: String,
  profilePhoto: String,
  role: {
    type: String,
    enum: ['admin', 'doctor', 'organization', null],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'mediloungeusers' // Changed collection name
});

const MediloungeUser = mongoose.model('MediloungeUser', mediloungeUserSchema);
module.exports = MediloungeUser;