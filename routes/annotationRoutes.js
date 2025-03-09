const express = require('express');
const router = express.Router();
const annotationController = require('../controllers/annotationController');

// Route to add a new annotation
router.post('/add', annotationController.addAnnotation);

// Route to update an existing annotation
router.put('/update', annotationController.updateAnnotation);

// Route to delete an annotation
router.delete('/delete', annotationController.deleteAnnotation);

// Route to fetch all annotations for a key
router.get('/fetchAll', annotationController.fetchAllAnnotations);

module.exports = router;