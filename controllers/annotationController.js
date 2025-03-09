const Annotation = require('../models/Annotation');

// Validate 12-character alphanumeric key
const validateKey = (key) => {
  const keyRegex = /^[a-zA-Z0-9]{12}$/;
  return keyRegex.test(key);
};

// Add a new annotation
exports.addAnnotation = async (req, res) => {
  try {
    const { key, annotation } = req.body;
    
    // Validate key format
    if (!key || !validateKey(key)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Key must be a 12-character alphanumeric string' 
      });
    }
    
    if (!annotation || !annotation.uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields (annotation with uid)' 
      });
    }

    // Check if document with this key exists
    let userAnnotation = await Annotation.findOne({ key });

    if (userAnnotation) {
      // Check if annotation with this UID already exists
      const existingAnnotation = userAnnotation.annotations.find(
        anno => anno.uid === annotation.uid
      );
      
      if (existingAnnotation) {
        return res.status(400).json({
          success: false,
          message: 'Annotation with this UID already exists'
        });
      }
      
      // Add new annotation to existing document
      userAnnotation.annotations.push(annotation);
      userAnnotation.updatedAt = Date.now();
      await userAnnotation.save();
    } else {
      // Create new document with this annotation
      userAnnotation = new Annotation({
        key,
        annotations: [annotation]
      });
      await userAnnotation.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Annotation added successfully',
      data: userAnnotation
    });
  } catch (error) {
    console.error('Error adding annotation:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding annotation',
      error: error.message
    });
  }
};

// Update an existing annotation
exports.updateAnnotation = async (req, res) => {
  try {
    const { key, annotationUID, updatedData } = req.body;
    
    // Validate key format
    if (!key || !validateKey(key)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Key must be a 12-character alphanumeric string' 
      });
    }
    
    if (!annotationUID || !updatedData || !updatedData.uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields (annotationUID, updatedData with uid)' 
      });
    }

    // Ensure UIDs match
    if (annotationUID !== updatedData.uid) {
      return res.status(400).json({
        success: false,
        message: 'UID in updatedData must match annotationUID'
      });
    }

    // Find document with this key
    const userAnnotation = await Annotation.findOne({ key });

    if (!userAnnotation) {
      return res.status(404).json({
        success: false,
        message: 'No annotations found for this key'
      });
    }
    
    // Find the specific annotation
    const annotationIndex = userAnnotation.annotations.findIndex(
      anno => anno.uid === annotationUID
    );
    
    if (annotationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Annotation with this UID not found'
      });
    }
    
    // Simply replace the entire annotation object
    userAnnotation.annotations[annotationIndex] = updatedData;
    userAnnotation.updatedAt = Date.now();
    await userAnnotation.save();

    return res.status(200).json({
      success: true,
      message: 'Annotation updated successfully',
      data: updatedData
    });
  } catch (error) {
    console.error('Error updating annotation:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating annotation',
      error: error.message
    });
  }
};

// Delete an annotation
exports.deleteAnnotation = async (req, res) => {
  try {
    const { key, annotationUID } = req.body;
    
    // Validate key format
    if (!key || !validateKey(key)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Key must be a 12-character alphanumeric string' 
      });
    }
    
    if (!annotationUID) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required field (annotationUID)' 
      });
    }

    // Find document with this key
    const userAnnotation = await Annotation.findOne({ key });

    if (!userAnnotation) {
      return res.status(404).json({
        success: false,
        message: 'No annotations found for this key'
      });
    }
    
    // Find the specific annotation
    const initialLength = userAnnotation.annotations.length;
    userAnnotation.annotations = userAnnotation.annotations.filter(
      anno => anno.uid !== annotationUID
    );
    
    // Check if any annotation was removed
    if (userAnnotation.annotations.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Annotation with this UID not found'
      });
    }
    
    userAnnotation.updatedAt = Date.now();
    await userAnnotation.save();

    return res.status(200).json({
      success: true,
      message: 'Annotation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting annotation:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting annotation',
      error: error.message
    });
  }
};

// Fetch all annotations for a key
exports.fetchAllAnnotations = async (req, res) => {
  try {
    const { key } = req.query;
    
    // Validate key format
    if (!key || !validateKey(key)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Key must be a 12-character alphanumeric string' 
      });
    }

    const userAnnotation = await Annotation.findOne({ key });

    if (!userAnnotation) {
      return res.status(404).json({
        success: false,
        message: 'No annotations found for this key'
      });
    }

    return res.status(200).json({
      success: true,
      data: userAnnotation.annotations
    });
  } catch (error) {
    console.error('Error fetching annotations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching annotations',
      error: error.message
    });
  }
};