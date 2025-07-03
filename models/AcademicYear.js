const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const semesterSchema = new Schema({
  semesterName: {
    type: String,
    required: true,
    trim: true
  },
  academicStartDate: {
    type: Date,
    required: true
  },
  academicEndDate: {
    type: Date,
    default: null
  },
  endDateStatus: {
    type: String,
    enum: ['Completed', 'Pending', 'Cancelled'],
    default: 'Pending',
    required: true
  }
}, { _id: false }); // Do not generate _id for subdocuments unless explicitly needed

const academicYearSchema = new Schema({
  academicYear: {
    yearNumber: {
      type: Number,
      required: true
    },
    yearName: {
      type: String,
      required: true,
      trim: true
    }
  },
  semesters: [semesterSchema]
}, {
  timestamps: true
});

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);

module.exports = AcademicYear;