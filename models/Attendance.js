const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  associate_id: {
    type: String,
    required: true,
  },
  attendance_date: {
    type: Date,
    required: true,
    set: function(date) {
      if (date) {
        const d = new Date(date);
        d.setUTCHours(0, 0, 0, 0); 
        return d;
      }
      return date;
    }
  },
  attendance_mark: {
    type: String,
    required: true,
    enum: ['Present', 'Absent', 'Late', 'Excused', 'Holiday', 'Cancelled'],
    default: 'Absent', 
    trim: true
  },
  markedByFacultyId: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty',
    required: false,
    default: null
  }
}, {
  timestamps: false
});

attendanceSchema.index({ associate_id: 1, attendance_date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;