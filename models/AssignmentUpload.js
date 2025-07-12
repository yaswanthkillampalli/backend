const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the AssignmentUpload Schema
const assignmentUploadSchema = new Schema({
  // assignmentId: Reference to the assignment
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  // studentId: Reference to the student
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  // courseId: Reference to the course
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  // fileUrl: URL of the uploaded file (e.g., Cloudinary)
  fileUrl: {
    type: String,
    required: true,
    trim: true
  },
  // fileName: Original name of the uploaded file
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  // fileSize: Size of the file in bytes
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  // fileType: Type/extension of the file (e.g., pdf, docx)
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'doc', 'docx'],
    trim: true
  },
  // uploadedAt: Date and time the file was uploaded
  uploadedAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Create the AssignmentUpload Model
const AssignmentUpload = mongoose.model('AssignmentUpload', assignmentUploadSchema);

module.exports = AssignmentUpload;