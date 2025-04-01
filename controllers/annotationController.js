const Annotation = require('../models/Annotation');

// Get annotations by passkey
exports.getAnnotations = async (req, res) => {
  try {
    const { passkey } = req.query;
    
    if (!passkey || !/^[a-zA-Z0-9]{12}$/.test(passkey)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid passkey format. Must be 12 alphanumeric characters.' 
      });
    }
    
    // Find the most recent annotation document for this passkey
    const annotation = await Annotation.findOne({ passkey })
      .sort({ updatedAt: -1 })
      .select('annotations imageName imageUrl');
    
    if (!annotation) {
      return res.status(200).json({ 
        success: true, 
        message: 'No annotations found for this passkey',
        annotations: [],
        imageName: null,
        imageUrl: null
      });
    }
    
    return res.status(200).json({
      success: true,
      annotations: annotation.annotations,
      imageName: annotation.imageName,
      imageUrl: annotation.imageUrl
    });
  } catch (error) {
    console.error('Error retrieving annotations:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while retrieving annotations' 
    });
  }
};

// Create or update annotations
exports.saveAnnotations = async (req, res) => {
  try {
    const { passkey, imageName, imageUrl, annotations } = req.body;
    
    if (!passkey || !/^[a-zA-Z0-9]{12}$/.test(passkey)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid passkey format. Must be 12 alphanumeric characters.' 
      });
    }
    
    if (!annotations || !Array.isArray(annotations)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Annotations must be provided as an array' 
      });
    }
    
    if (!imageName || !imageUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image name and URL are required' 
      });
    }
    
    // Find existing annotation document or create a new one
    let annotationDoc = await Annotation.findOne({ passkey });
    
    if (annotationDoc) {
      // Update existing document
      annotationDoc.annotations = annotations;
      annotationDoc.imageName = imageName;
      annotationDoc.imageUrl = imageUrl;
      annotationDoc.updatedAt = Date.now();
      
      await annotationDoc.save();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Annotations updated successfully',
        _id: annotationDoc._id
      });
    } else {
      // Create new document
      const newAnnotation = new Annotation({
        passkey,
        imageName,
        imageUrl,
        annotations
      });
      
      await newAnnotation.save();
      
      return res.status(201).json({ 
        success: true, 
        message: 'Annotations saved successfully',
        _id: newAnnotation._id
      });
    }
  } catch (error) {
    console.error('Error saving annotations:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while saving annotations' 
    });
  }
};

// Delete annotations by passkey
exports.deleteAnnotations = async (req, res) => {
  try {
    const { passkey } = req.params;
    
    if (!passkey || !/^[a-zA-Z0-9]{12}$/.test(passkey)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid passkey format. Must be 12 alphanumeric characters.' 
      });
    }
    
    const result = await Annotation.deleteOne({ passkey });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No annotations found for this passkey' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Annotations deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting annotations:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting annotations' 
    });
  }
};