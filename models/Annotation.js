const mongoose = require('mongoose');

// Main annotation schema
const AnnotationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    match: [/^[a-zA-Z0-9]{12}$/, 'Key must be a 12-character alphanumeric string'],
    index: true
  },
  annotations: {
    type: [mongoose.Schema.Types.Mixed], // Using Mixed type to store any JSON structure
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure key is unique
AnnotationSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model('Annotation', AnnotationSchema);