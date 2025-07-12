const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Submission Content sub-schema
const submissionContentSchema = new Schema({
  // text: Optional text-based submission content
  text: {
    type: String,
    trim: true,
    default: null
  },
  // fileUrl: URL of the submitted file (e.g., Cloudinary)
  fileUrl: {
    type: String,
    trim: true,
    default: null
  },
  // answers: Array of text answers for individual questions
  answers: {
    type: [String],
    default: []
  }
}, { _id: false });

// Define the StudentAssignment Schema
const studentAssignmentSchema = new Schema({
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
  // status: The current status of the assignment for the student
  status: {
    type: String,
    required: true,
    enum: ['Assigned', 'Submitted', 'Completed'],
    default: 'Assigned',
    trim: true
  },
  // submissionDate: The date the student submitted the assignment
  submissionDate: {
    type: Date,
    default: null
  },
  // submissionContent: Details of the student's submission
  submissionContent: {
    type: submissionContentSchema,
    default: {}
  },
  // grade: The grade assigned to the submission
  grade: {
    type: String,
    trim: true,
    default: null
  },
  // feedback: Feedback provided by the faculty
  feedback: {
    type: String,
    trim: true,
    default: null
  },
  // gradedByFacultyId: Reference to the faculty who graded the submission
  gradedByFacultyId: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty',
    default: null
  },
  // gradedAt: The date the submission was graded
  gradedAt: {
    type: Date,
    default: null
  },
  // isLate: Indicates if the submission was late
  isLate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create the StudentAssignment Model
const StudentAssignment = mongoose.model('StudentAssignment', studentAssignmentSchema);

module.exports = StudentAssignment;