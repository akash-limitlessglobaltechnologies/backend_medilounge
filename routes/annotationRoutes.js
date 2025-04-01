const express = require('express');
const router = express.Router();
const annotationController = require('../controllers/annotationController');

/**
 * @route   GET /api/annotations/image
 * @desc    Get annotations by passkey
 * @access  Public
 * @param   {string} passkey - 12-digit alphanumeric passkey
 */
router.get('/image', annotationController.getAnnotations);

/**
 * @route   POST /api/annotations/image
 * @desc    Create or update annotations
 * @access  Public
 * @body    {
 *            passkey: string,
 *            imageName: string,
 *            imageUrl: string,
 *            annotations: array
 *          }
 */
router.post('/image', annotationController.saveAnnotations);

/**
 * @route   DELETE /api/annotations/image/:passkey
 * @desc    Delete annotations by passkey
 * @access  Public
 * @param   {string} passkey - 12-digit alphanumeric passkey
 */
router.delete('/image/:passkey', annotationController.deleteAnnotations);

module.exports = router;