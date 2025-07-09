const cloudinary = require('../config/cloudinary');
const Upload = require('../models/Upload');
const Student = require('../models/Student');
const User = require('../models/User');
const getUserProfile = async (userObjectId) => {
    try {
        const user = await User.findById(userObjectId);
        if (!user || user.role !== 'student' || user.associatedCollection !== 'students' || !user.associatedId) {
            return null; 
        }
        return user;
    } catch (error) {
        console.error("Error fetching student ID from user:", error);
        return null;
    }
};
exports.uploadDocument = async (req, res) => {
  try {
    const userObjectId = req.user.id;
    const userProfile = await getUserProfile(userObjectId);

    if (!userProfile || !userProfile.username) {
      return res.status(403).json({ message: 'Access denied: Not a valid student user or association missing.' });
    }
    const associateId = userProfile.username;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { documentType } = req.body;

    if (!documentType || !['AadhaarCard', 'Certificate', 'Marksheet', 'AdmissionForm', 'PassportPhoto'].includes(documentType)) {
      return res.status(400).json({ message: 'Invalid or missing document type.' });
    }

    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploadOptions = {
      folder: `student_documents/${associateId}/${documentType}`,
      resource_type: 'auto',
    };

    const cloudinaryResult = await cloudinary.uploader.upload(base64File, uploadOptions); // Use the correctly formatted base64 string

    const newUpload = new Upload({
      associateId: associateId,
      type: documentType,
      resourceUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
    });

    await newUpload.save();

    res.status(201).json({
      message: 'Document uploaded and details saved successfully!',
      uploadDetails: {
        _id: newUpload._id,
        associateId: newUpload.associateId,
        type: newUpload.type,
        resourceUrl: newUpload.resourceUrl,
        publicId: newUpload.publicId,
        createdAt: newUpload.createdAt
      }
    });

  } catch (error) {
    console.error('Error during document upload:', error);
    res.status(500).json({ message: 'Failed to upload document.', error: error.message });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    if(!req.file){
      return res.status(400).json({ msg: 'No image file uploaded.' });
    }
    const userObjectId = req.user.id;
    const userProfile = await getUserProfile(userObjectId);
    const studentProfile = await Student.findById(userProfile.associatedId);
    const userId = studentProfile.studentId;
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      , 
      {
      folder: `profile_pictures/${userId}`,
      resource_type: 'image',
      public_id: `${userId}_dp`,
    });

    studentProfile.imageurl = result.secure_url;
    await studentProfile.save();

    res.json({
      msg: 'Profile picture uploaded successfully',
      profileImageUrl: result.secure_url
    });
  } catch (error) {
    console.error('Error during profile picture upload:', error);
    res.status(500).json({ message: 'Failed to upload profile picture.', error: error.message });
  }
}