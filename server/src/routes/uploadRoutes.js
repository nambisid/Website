const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

router.post('/images', auth, admin, upload.array('images', 5), uploadController.uploadImages);
router.delete('/images/:publicId', auth, admin, uploadController.deleteImage);

module.exports = router;
