const mongoose = require('mongoose');

const AnnotationSchema = new mongoose.Schema({
  passkey: {
    type: String,
    required: true,
    trim: true,
    match: /^[a-zA-Z0-9]{12}$/,
    index: true
  },
  imageName: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  annotations: [{
    id: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['circle', 'rectangle', 'ellipse', 'bidirectional']
    },
    x: {
      type: Number,
      required: function() {
        return ['circle', 'rectangle', 'ellipse'].includes(this.type);
      }
    },
    y: {
      type: Number,
      required: function() {
        return ['circle', 'rectangle', 'ellipse'].includes(this.type);
      }
    },
    width: {
      type: Number,
      required: function() {
        return ['rectangle', 'ellipse'].includes(this.type);
      }
    },
    height: {
      type: Number,
      required: function() {
        return ['rectangle', 'ellipse'].includes(this.type);
      }
    },
    radius: {
      type: Number,
      required: function() {
        return this.type === 'circle';
      }
    },
    points: {
      type: [[Number]],
      required: function() {
        return this.type === 'bidirectional';
      },
      validate: {
        validator: function(points) {
          return this.type !== 'bidirectional' || (points && points.length === 4);
        },
        message: 'Bidirectional annotations must have exactly 4 points'
      }
    },
    color: {
      type: String,
      required: true,
      default: '#00ff00'
    },
    description: {
      type: String,
      default: ''
    },
    locked: {
      type: Boolean,
      default: false
    },
    complete: {
      type: Boolean,
      default: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
AnnotationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a compound index for faster lookups
AnnotationSchema.index({ passkey: 1, imageName: 1 });

const Annotation = mongoose.model('Annotation', AnnotationSchema);

module.exports = Annotation;