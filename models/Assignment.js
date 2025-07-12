const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Question sub-schema
const questionSchema = new Schema({
  // questionNumber: The numerical identifier for the question
  questionNumber: {
    type: Number,
    required: true,
    min: 1
  },
  // questionText: The text/content of the question
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  // maxScore: The maximum score/points for the question
  maxScore: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Define the Attachment sub-schema
const attachmentSchema = new Schema({
  // fileName: The name of the attached file
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  // url: The URL where the file is stored (e.g., Cloudinary)
  url: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

// Define the Assignment Schema
const assignmentSchema = new Schema({
  // courseId: Reference to the course this assignment belongs to
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  // facultyId: Reference to the faculty member who created the assignment
  facultyId: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  // title: The title of the assignment
  title: {
    type: String,
    required: true,
    trim: true
  },
  // description: A detailed description of the assignment
  description: {
    type: String,
    required: true,
    trim: true
  },
  // assignmentType: The type of assignment (e.g., Essay, Quiz, Coding)
  assignmentType: {
    type: String,
    required: true,
    enum: ['Essay', 'Quiz', 'Coding', 'Project', 'Other'],
    trim: true
  },
  // totalMarks: The total marks possible for the assignment
  totalMarks: {
    type: Number,
    required: true,
    min: 0
  },
  // dueDate: The submission deadline for the assignment
  dueDate: {
    type: Date,
    required: true
  },
  // questions: An array of questions for the assignment
  questions: {
    type: [questionSchema],
    default: []
  },
  // attachments: An array of reference materials or files
  attachments: {
    type: [attachmentSchema],
    default: []
  }
}, {
  timestamps: true
});

// Create the Assignment Model
const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;