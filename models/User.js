const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Shorthand for mongoose.Schema

// Define the User Schema
const userSchema = new Schema({
  // username: A unique identifier for the user (e.g., student ID, employee ID)
  username: {
    type: String,
    required: true,
    unique: true, // Ensures unique usernames
    trim: true,
    lowercase: false // Store usernames in lowercase for consistent lookups
  },
  // email: The user's email address, also unique
  email: {
    type: String,
    required: true,
    unique: true, // Ensures unique email addresses
    trim: true,
    lowercase: true,
    // Basic email validation using a regex
    match: [/.+@.+\..+/, 'Please fill a valid email address']
  },
  // passwordHash: Stores the hashed password (NEVER store plain passwords)
  passwordHash: {
    type: String,
    required: true
  },
  passwordVersion: {
    type:Number,
    default: 1, // Default to empty string, can be updated later
    required: true // Ensure this field is always present
  },
  // role: The role of the user (e.g., "student", "faculty", "admin")
  role: {
    type: String,
    required: true,
    enum: ['student', 'faculty', 'admin'], // Restrict roles to predefined values
    trim: true,
    lowercase: true
  },
  // associatedId: References the ObjectId of the associated document (e.g., Student or Faculty)
  // This field will be populated based on the 'role' and 'associatedCollection'
  associatedId: {
    type: Schema.Types.ObjectId,
    refPath: 'associatedCollection', // Dynamically reference collection based on 'associatedCollection' field
    default: null // Can be null if a user doesn't directly map to a student/faculty (e.g., pure admin)
  },
  // associatedCollection: Stores the name of the collection this user is associated with
  // Used with refPath for dynamic population (e.g., 'students', 'faculties')
  associatedCollection: {
    type: String,
    required: function() {
      // This field is required if associatedId is present
      return this.associatedId !== null;
    },
    enum: ['students', 'faculties', 'admins'], // Example: collections for student, faculty, admin details
    default: null // Can be null
  },
  // status: The account status (e.g., "Active", "Inactive", "Suspended")
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Inactive', 'Suspended', 'Pending'], // Example allowed values
    default: 'Active',
    trim: true
  },
  // isVerified: Boolean indicating if the user's email or account has been verified
  isVerified: {
    type: Boolean,
    default: false
  },
  // token: For storing things like password reset tokens or email verification tokens
  token: {
    type: String,
    default: '' // Default to empty string
  },
  // lastLogin: Timestamp of the user's last successful login
  lastLogin: {
    type: Date,
    default: null // Can be null if never logged in
  }
}, {
  // timestamps: Automatically add `createdAt` and `updatedAt` fields
  timestamps: true
});

// Create the User Model from the Schema
const User = mongoose.model('User', userSchema);

module.exports = User;
