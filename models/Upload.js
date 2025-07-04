const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UploadSchema = new Schema({
  associateId: {
    type: String, // Assuming associate_id is a string, like '238T1A4252'
    required: true,
    index: true // Index for faster lookups by associate
  },
  type: {
    type: String,
    required: true,
    enum: [ // Define the allowed types of documents
      'AadhaarCard',
      'Certificate',
      'Marksheet',
      'AdmissionForm',
      'PassportPhoto',
      // Add other types as needed
    ],
    trim: true
  },
  resourceUrl: {
    type: String,
    required: true,
    unique: true 
  },
  publicId: {
    type: String,
    required: true,
    unique: true 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

UploadSchema.index({ associateId: 1, type: 1 });

const Upload = mongoose.model('Upload', UploadSchema); 

module.exports = Upload;