const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const calendarSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true,
    unique: true, // Keep unique if you want each date to be unique
    set: function(date) {
      if (date) {
        const d = new Date(date);
        d.setUTCHours(0, 0, 0, 0); 
        return d;
      }
      return date;
    }
  },
  type: {
    firstYear: {
      type: String,
      enum: ['Working', 'Holiday', 'Weekend', 'Exam Day', 'Vacation'],
      default: 'Working Day',
      required: true
    },
    secondYear: {
      type: String,
      enum: ['Working', 'Holiday', 'Weekend', 'Exam Day', 'Vacation'],
      default: 'Working Day',
      required: true
    },
    thirdYear: {
      type: String,
      enum: ['Working', 'Holiday', 'Weekend', 'Exam Day', 'Vacation'],
      default: 'Working Day',
      required: true
    },
    fourthYear: {
      type: String,
      enum: ['Working', 'Holiday', 'Weekend', 'Exam Day', 'Vacation'],
      default: 'Working Day',
      required: true
    }
  },
  isHoliday: {
    type: Boolean,
    required: true,
    default: false
  },
  holidayReason: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: false
});

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;