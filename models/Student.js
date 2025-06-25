const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Shorthand for mongoose.Schema

// Define the Contact sub-schema for Student and Parent
const contactSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false }); // Do not create an _id for sub-documents

// Define the Address sub-schema
const addressSchema = new Schema({
  street: {
    type: String,
    trim: true,
    default: ''
  },
  village: {
    type: String,
    trim: true,
    default: ''
  },
  mandal: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  state: {
    type: String,
    trim: true,
    default: ''
  },
  zipCode: {
    type: String,
    trim: true,
    default: ''
  },
  country: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

// Define the Parent sub-schema
const parentSchema = new Schema({
  relation: {
    type: String,
    required: true,
    trim: true,
    enum: ['Father', 'Mother', 'Guardian'] // Example relations
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: contactSchema, // Embed the contactSchema
    required: true
  }
}, { _id: false }); // Do not create an _id for sub-documents

// Define the Student Schema
const studentSchema = new Schema({
  // studentId: A unique identifier for the student (e.g., "238T1A4252")
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // firstName: The first name of the student
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  // lastName: The last name of the student
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  // dateOfBirth: The student's date of birth
  dateOfBirth: {
    type: Date,
    required: true
  },
  // gender: The student's gender
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'], // Example allowed values
    trim: true
  },
  // contact: Nested object for student's contact details
  contact: {
    type: contactSchema, // Embed the contactSchema
    required: true
  },
  // address: Nested object for student's address details
  address: {
    type: addressSchema, // Embed the addressSchema
    required: true
  },
  // parents: An array of nested parent/guardian objects
  parents: {
    type: [parentSchema], // Array of parentSchema
    default: []
  },
  // enrollmentDate: The date the student was enrolled in the institution
  enrollmentDate: {
    type: Date,
    required: true
  },
  // program: The academic program the student is enrolled in (e.g., "B.Tech")
  program: {
    type: String,
    required: true,
    trim: true
  },
  // branch: The specific branch/specialization (e.g., "Computer Science & Engineering (AI & ML)")
  branch: {
    type: String,
    required: true,
    trim: true
  },
  // branchcode: A code for the branch (e.g., "42")
  branchcode: {
    type: String,
    required: true,
    trim: true
  },
  // currentSemester: The student's current academic semester
  currentSemester: {
    type: Number,
    required: true,
    min: 1
  },
  // status: The student's current academic status (e.g., "Active", "Graduated", "Suspended")
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Graduated', 'Suspended', 'On Leave', 'Dropped Out'], // Example allowed values
    default: 'Active',
    trim: true
  },
  // imageurl: URL to the student's profile image
  imageurl: {
    type: String,
    default: '' // Can be an empty string if no image
  }
}, {
  // timestamps: Automatically add `createdAt` and `updatedAt` fields
  timestamps: true
});

// Create the Student Model from the Schema
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
