const express = require('express');
const fileController = require('../controlers/fileController.js');
const router = express.Router();

// Route for uploading files
router.post('/upload', fileController.upload.single('file'), fileController.uploadFile);
router.get('/images', fileController.getAllImages);
router.post('/images',fileController.sendImageBySerialNumber)
module.exports = router;