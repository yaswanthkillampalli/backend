const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Shorthand for mongoose.Schema

// Define the Attendance Schema
const attendanceSchema = new Schema({
  // studentId: References the ObjectId of the Student document
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student', // References the 'Student' model
    required: true
  },
  // date: The specific date for which the attendance is recorded.
  // This is crucial for the "calendar" view.
  date: {
    type: Date,
    required: true,
    // Ensure that only the date part is considered for uniqueness
    // (time component should ideally be ignored or standardized to midnight)
    set: function(date) {
      if (date) {
        const d = new Date(date);
        d.setUTCHours(0, 0, 0, 0); // Normalize to start of the day in UTC
        return d;
      }
      return date;
    }
  },
  // status: The attendance status for that date.
  // Example: 'Present', 'Absent', 'Late', 'Excused', 'Holiday', 'Cancelled'
  status: {
    type: String,
    required: true,
    enum: ['Present', 'Absent', 'Late', 'Excused', 'Holiday', 'Cancelled'],
    default: 'Absent', // Default to absent if not specified
    trim: true
  },
  // markedByFacultyId: References the ObjectId of the Faculty member who marked this attendance.
  // Useful for auditing and knowing who took attendance.
  markedByFacultyId: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty', // References the 'Faculty' model
    required: false, // Could be optional if attendance is auto-generated for holidays etc.
    default: null
  },
  // remark: Optional additional notes about the attendance (e.g., reason for absence).
  remark: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  // timestamps: Automatically add `createdAt` and `updatedAt` fields
  timestamps: true
});

// Add a compound unique index to prevent duplicate attendance records
// for the same student and date.
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

// Create the Attendance Model from the Schema
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
