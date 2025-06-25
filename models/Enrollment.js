const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Shorthand for mongoose.Schema

// Define the Enrollment Schema
const enrollmentSchema = new Schema({
  // studentId: References the ObjectId of the Student document
  studentId: {
    type: Schema.Types.ObjectId, // Specifies that this is an ObjectId
    ref: 'Student',              // References the 'Student' model (assuming you have one)
    required: true
  },
  // courseId: References the ObjectId of the Course document
  courseId: {
    type: Schema.Types.ObjectId, // Specifies that this is an ObjectId
    ref: 'Course',               // References the 'Course' model (as defined in course_model_schema)
    required: true
  },
  // facultyId: References the ObjectId of the Faculty document (e.g., the instructor)
  facultyId: {
    type: Schema.Types.ObjectId, // Specifies that this is an ObjectId
    ref: 'Faculty',              // References the 'Faculty' model (assuming you have one)
    required: true
  },
  // academicYear: The academic year of the enrollment (e.g., "2023-2024")
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  // semester: The semester of the enrollment (e.g., "1", "2", "Fall", "Spring")
  semester: {
    type: String,
    required: true,
    trim: true
  },
  // enrollmentDate: The date when the student enrolled in the course
  enrollmentDate: {
    type: Date,
    default: Date.now // Defaults to the current date if not provided
  },
  // status: The current status of the enrollment (e.g., "Enrolled", "Dropped", "Completed")
  status: {
    type: String,
    required: true,
    enum: ['Enrolled', 'Dropped', 'Completed', 'Waitlisted', 'Pending'], // Example allowed values
    default: 'Enrolled',
    trim: true
  }
}, {
  // timestamps: Automatically add `createdAt` and `updatedAt` fields
  timestamps: true
});

// Create the Enrollment Model from the Schema
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
