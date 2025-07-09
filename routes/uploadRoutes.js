const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadDocument, uploadProfilePicture} = require('../controllers/uploadController');
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

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post('/document', authenticate, uploadMiddleware.single('documentFile'), uploadDocument);
router.post('/profile-picture', authenticate, upload.single('profilePicture'), uploadProfilePicture);
module.exports = router;