const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Shorthand for mongoose.Schema

// Define the Qualification sub-schema
const qualificationSchema = new Schema({
  degree: {
    type: String,
    required: true,
    trim: true
  },
  field: {
    type: String,
    required: true,
    trim: true
  },
  university: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900, // Assuming a reasonable minimum year for graduation
    max: new Date().getFullYear() // Max year is current year
  }
}, { _id: false }); // Do not create an _id for sub-documents

// Define the Contact sub-schema
const contactSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Email should be unique for contact
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  officePhone: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

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

// Define the Faculty Schema
const facultySchema = new Schema({
  // facultyId: A unique identifier for the faculty member (e.g., "FAC0001")
  facultyId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // firstName: The first name of the faculty member
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  // lastName: The last name of the faculty member
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  // contact: Nested object for contact details
  contact: {
    type: contactSchema, // Embed the contactSchema
    required: true
  },
  // address: Nested object for address details
  address: {
    type: addressSchema, // Embed the addressSchema
    required: true
  },
  // department: The department the faculty member belongs to
  department: {
    type: String,
    required: true,
    trim: true
  },
  // designation: The faculty member's job title (e.g., "Professor", "Associate Professor")
  designation: {
    type: String,
    required: true,
    trim: true
  },
  // qualifications: An array of nested qualification objects
  qualifications: {
    type: [qualificationSchema], // Array of qualificationSchema
    default: []
  },
  // dateOfJoining: The date the faculty member joined the institution
  dateOfJoining: {
    type: Date,
    required: true
  },
  // coursesTaught: An array of course codes taught by this faculty member
  // These could potentially reference Course IDs, but for now, they are strings.
  coursesTaught: {
    type: [String], // Array of strings (course codes)
    default: []
  },
  // status: The current employment status (e.g., "Active", "Retired", "On Leave")
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Retired', 'On Leave', 'Resigned'], // Example allowed values
    default: 'Active',
    trim: true
  }
}, {
  // timestamps: Automatically add `createdAt` and `updatedAt` fields
  timestamps: true
});

// Create the Faculty Model from the Schema
const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;
