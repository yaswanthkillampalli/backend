const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const authenticate = require('../middleware/authMiddleWare');

const storage = multer.memoryStorage();

const uploadMiddleware = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true); 
    } else {
      cb(new Error('Only image or PDF files are allowed!'), false); // Reject otherwise
    }
  }
});

router.post('/document', authenticate, uploadMiddleware.single('documentFile'), uploadController.uploadDocument);

module.exports = router;