const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAssignmentsForStudent,
  getAssignmentPreview,
  getFullAssignment,
  updateAssignmentSubmission,
  getSubmissionHistory
} = require('../controllers/assignmentController');
const authenticate = require('../middleware/authMiddleWare');

const storage = multer.memoryStorage();

const uploadMiddleware = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, or DOCX files are allowed!'), false);
    }
  }
});

// Routes
router.get('/assignments', authenticate, getAssignmentsForStudent);
router.get('/assignments/:assignmentId/preview', authenticate, getAssignmentPreview);
router.get('/assignments/:assignmentId', authenticate, getFullAssignment);
router.post('/assignments/:assignmentId/submit', authenticate, uploadMiddleware.array('files'), updateAssignmentSubmission);
router.get('/assignments/:assignmentId/submissions', authenticate, getSubmissionHistory);

module.exports = router;