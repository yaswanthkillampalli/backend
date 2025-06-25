const mongoose = require('mongoose');

// Define the Course Schema
const courseSchema = new mongoose.Schema({
  // courseCode: A unique identifier for the course (e.g., "23110001")
  courseCode: {
    type: String,
    required: true, // This field is mandatory
    unique: true,   // Ensures that each courseCode is unique in the collection
    trim: true      // Removes whitespace from both ends of a string
  },
  // courseName: The full name of the course (e.g., "COMMUNICATIVE ENGLISH")
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  // description: A brief explanation of what the course covers
  description: {
    type: String,
    required: true,
    trim: true
  },
  // credits: The number of academic credits the course is worth
  credits: {
    type: Number,
    required: true,
    min: 0 // Credits should not be negative
  },
  // department: The academic department offering the course
  department: {
    type: String,
    required: true,
    trim: true
  },
  // syllabusUrl: A URL pointing to the course syllabus (can be empty)
  syllabusUrl: {
    type: String,
    default: '' // Default to an empty string if not provided
  },
  // prerequisites: An array of course codes that are required before taking this course
  prerequisites: {
    type: [String], // Array of strings
    default: []     // Default to an empty array if not provided
  },
  // isActive: A boolean indicating if the course is currently active or offered
  isActive: {
    type: Boolean,
    default: true // Default to true if not specified
  }
}, {
  // timestamps: Automatically add `createdAt` and `updatedAt` fields
  // Mongoose handles the "$date" format automatically.
  timestamps: true
});

// Create the Course Model from the Schema
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
