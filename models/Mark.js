const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Shorthand for mongoose.Schema

// Define the Mark Schema
const markSchema = new Schema({
  // enrollmentId: References the ObjectId of the Enrollment document this mark belongs to
  enrollmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Enrollment', // References the 'Enrollment' model
    required: true,
    unique: true // A single enrollment should have one mark entry for a course
  },
  // studentId: References the ObjectId of the Student document
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student', // References the 'Student' model (assuming you have one)
    required: true
  },
  // courseId: References the ObjectId of the Course document
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course', // References the 'Course' model
    required: true
  },
  // facultyId: References the ObjectId of the Faculty document who taught the course
  // (could be derived from Enrollment, but explicit here as per JSON)
  facultyId: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty', // References the 'Faculty' model
    required: true
  },
  // academicYear: The academic year the course was taken (e.g., "2023-2024")
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  // semester: The semester the course was taken (e.g., "1", "2", "Fall", "Spring")
  semester: {
    type: String,
    required: true,
    trim: true
  },
  // gradePoint: The numerical grade point for the course
  gradePoint: {
    type: Number,
    required: true,
    min: 0,
    max: 10 // Assuming a 10-point grading scale
  },
  // letterGrade: The letter grade equivalent (e.g., "A", "B", "C")
  letterGrade: {
    type: String,
    required: true,
    trim: true,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'P', 'NP', 'I', 'W'] // Example common grades
  },
  // creditsGained: The number of credits successfully gained for the course
  creditsGained: {
    type: Number,
    required: true,
    min: 0
  },
  // gradeStatus: The status of the grade (e.g., "Final", "Provisional", "Pending")
  gradeStatus: {
    type: String,
    required: true,
    enum: ['Final', 'Provisional', 'Pending', 'Incomplete', 'Withdrawn'], // Example allowed values
    default: 'Pending',
    trim: true
  },
  // gradedByFacultyId: References the ObjectId of the Faculty member who assigned the grade
  gradedByFacultyId: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty', // References the 'Faculty' model
    required: true
  },
  // submissionDate: The date when the grade was officially submitted
  submissionDate: {
    type: Date,
    required: true
  }
}, {
  // timestamps: Automatically add `createdAt` and `updatedAt` fields
  timestamps: true
});

// Create the Mark Model from the Schema
const Mark = mongoose.model('Mark', markSchema);

module.exports = Mark;
