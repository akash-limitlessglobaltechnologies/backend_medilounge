// models/csvData.js
const mongoose = require('mongoose');

const csvDataSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  csvData: {
    type: String,
    required: true
  },
  headers: {
    type: [String],
    default: []
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add a pre-save middleware to update the lastModified date
csvDataSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

const CSVData = mongoose.model('CSVData', csvDataSchema);

module.exports = CSVData;