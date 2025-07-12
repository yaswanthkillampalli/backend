const User = require('../models/User');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const StudentAssignment = require('../models/StudentAssignment');
const AssignmentUpload = require('../models/AssignmentUpload');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary'); // Your configured Cloudinary export

// Static upload guidelines
const defaultGuidelines = {
  maxFileSize: '10MB',
  acceptedFormats: ['pdf', 'doc', 'docx'],
  additionalInfo: 'Ensure your submission is a single file containing answers to all questions.'
};

// 1. Get Assignments for Assignment Page (Left Panel)
exports.getAssignmentsForStudent = async (req, res) => {
  try {
    const userObjectId = req.user.id;

    const user = await User.findById(userObjectId, 'associatedId associatedCollection').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.associatedCollection !== 'students') {
      return res.status(403).json({ message: 'Access denied: User is not a student.' });
    }
    const studentId = user.associatedId;

    const { status } = req.query;
    const query = { studentId: new mongoose.Types.ObjectId(studentId) };
    if (status) {
      if (status === 'Assigned') {
        query.status = 'Assigned';
      } else if (status === 'Submitted') {
        query.status = 'Submitted';
      } else if (status === 'Completed') {
        query.grade = { $ne: null };
      }
    }

    const assignments = await StudentAssignment.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'assignments',
          localField: 'assignmentId',
          foreignField: '_id',
          as: 'assignment'
        }
      },
      { $unwind: '$assignment' },
      {
        $lookup: {
          from: 'courses',
          localField: 'assignment.courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $lookup: {
          from: 'faculty',
          localField: 'assignment.facultyId',
          foreignField: '_id',
          as: 'faculty'
        }
      },
      { $unwind: '$faculty' },
      {
        $project: {
          _id: '$assignment._id',
          title: '$assignment.title',
          status: '$status',
          totalMarks: '$assignment.totalMarks',
          dueDate: '$assignment.dueDate',
          description: '$assignment.description',
          assignmentType: '$assignment.assignmentType',
          courseName: '$course.courseName',
          facultyName: { $concat: ['$faculty.firstName', ' ', '$faculty.lastName'] }
        }
      }
    ]);

    return res.status(200).json({
      assignments,
      message: 'Assignments retrieved successfully.'
    });
  } catch (error) {
    console.error('Error in getAssignmentsForStudent:', error);
    return res.status(500).json({ message: 'Server error. Could not retrieve assignments.' });
  }
};

// 2. Get Assignment Preview for Assignment Page (Right Panel)
exports.getAssignmentPreview = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Fetch assignment with course and faculty details
    const assignment = await Assignment.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(assignmentId) } },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $lookup: {
          from: 'faculty',
          localField: 'facultyId',
          foreignField: '_id',
          as: 'faculty'
        }
      },
      { $unwind: '$faculty' },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          assignmentType: 1,
          totalMarks: 1,
          dueDate: 1,
          questions: 1,
          courseName: '$course.courseName',
          facultyName: { $concat: ['$faculty.firstName', ' ', '$faculty.lastName'] }
        }
      }
    ]);

    if (!assignment.length) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    return res.status(200).json({
      assignment: assignment[0],
      message: 'Assignment preview retrieved successfully.'
    });
  } catch (error) {
    console.error('Error in getAssignmentPreview:', error);
    return res.status(500).json({ message: 'Server error. Could not retrieve assignment preview.' });
  }
};

// 3. Get Full Assignment Details for FullAssignment Page
exports.getFullAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userObjectId = req.user.id;

    // Get studentId from users collection
    const user = await User.findById(userObjectId, 'associatedId associatedCollection').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.associatedCollection !== 'students') {
      return res.status(403).json({ message: 'Access denied: User is not a student.' });
    }
    const studentId = user.associatedId;

    // Fetch assignment with course, faculty, and studentAssignment details
    const assignment = await Assignment.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(assignmentId) } },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $lookup: {
          from: 'faculty',
          localField: 'facultyId',
          foreignField: '_id',
          as: 'faculty'
        }
      },
      { $unwind: '$faculty' },
      {
        $lookup: {
          from: 'studentAssignments',
          let: { assignmentId: '$_id', studentId: new mongoose.Types.ObjectId(studentId) },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$assignmentId', '$$assignmentId'] },
                    { $eq: ['$studentId', '$$studentId'] }
                  ]
                }
              }
            }
          ],
          as: 'studentAssignment'
        }
      },
      { $unwind: { path: '$studentAssignment', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          courseId: 1,
          facultyId: 1,
          title: 1,
          description: 1,
          assignmentType: 1,
          totalMarks: 1,
          dueDate: 1,
          questions: 1,
          attachments: 1,
          courseName: '$course.courseName',
          facultyName: { $concat: ['$faculty.firstName', ' ', '$faculty.lastName'] },
          submission: {
            status: '$studentAssignment.status',
            submissionDate: '$studentAssignment.submissionDate',
            submissionContent: '$studentAssignment.submissionContent',
            grade: '$studentAssignment.grade',
            feedback: '$studentAssignment.feedback',
            isLate: '$studentAssignment.isLate'
          }
        }
      }
    ]);

    if (!assignment.length) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // Include static guidelines
    const guidelines = { ...defaultGuidelines, assignmentType: assignment[0].assignmentType };

    return res.status(200).json({
      assignment: { ...assignment[0], guidelines },
      message: 'Full assignment details retrieved successfully.'
    });
  } catch (error) {
    console.error('Error in getFullAssignment:', error);
    return res.status(500).json({ message: 'Server error. Could not retrieve full assignment details.' });
  }
};

// 4. Update Assignment Submission
exports.updateAssignmentSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userObjectId = req.user.id;
    const files = req.files;

    // Get studentId from users collection
    const user = await User.findById(userObjectId, 'associatedId associatedCollection').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.associatedCollection !== 'students') {
      return res.status(403).json({ message: 'Access denied: User is not a student.' });
    }
    const studentId = user.associatedId;

    // Validate assignment and due date
    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }
    const isLate = new Date() > new Date(assignment.dueDate);

    // Validate files
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const uploadedFiles = [];
    for (const file of files) {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'raw', folder: `submissions/${assignmentId}/${studentId}` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      uploadedFiles.push({
        fileName: file.originalname,
        fileUrl: result.secure_url,
        fileSize: file.size,
        fileType: file.originalname.split('.').pop().toLowerCase(),
        uploadedAt: new Date()
      });
    }

    // Update or create studentAssignment
    const studentAssignment = await StudentAssignment.findOneAndUpdate(
      { assignmentId: new mongoose.Types.ObjectId(assignmentId), studentId: new mongoose.Types.ObjectId(studentId) },
      {
        $set: {
          status: 'Submitted',
          submissionDate: new Date(),
          submissionContent: { fileUrl: uploadedFiles[0]?.fileUrl || null, text: null, answers: [] },
          isLate,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Store uploads in assignmentUploads
    await AssignmentUpload.insertMany(
      uploadedFiles.map((file) => ({
        assignmentId: new mongoose.Types.ObjectId(assignmentId),
        studentId: new mongoose.Types.ObjectId(studentId),
        courseId: new mongoose.Types.ObjectId(assignment.courseId),
        ...file,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );

    return res.status(200).json({
      submission: {
        status: studentAssignment.status,
        submissionDate: studentAssignment.submissionDate,
        fileUrl: studentAssignment.submissionContent.fileUrl,
        isLate: studentAssignment.isLate
      },
      message: 'Assignment submitted successfully.'
    });
  } catch (error) {
    console.error('Error in updateAssignmentSubmission:', error);
    return res.status(500).json({ message: 'Server error. Could not submit assignment.' });
  }
};

// 5. Get Submission History for FullAssignment Page
exports.getSubmissionHistory = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userObjectId = req.user.id;

    // Get studentId from users collection
    const user = await User.findById(userObjectId, 'associatedId associatedCollection').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.associatedCollection !== 'students') {
      return res.status(403).json({ message: 'Access denied: User is not a student.' });
    }
    const studentId = user.associatedId;

    // Fetch studentAssignment and uploads
    const [studentAssignment, uploads] = await Promise.all([
      StudentAssignment.findOne({
        assignmentId: new mongoose.Types.ObjectId(assignmentId),
        studentId: new mongoose.Types.ObjectId(studentId)
      }).lean(),
      AssignmentUpload.find({
        assignmentId: new mongoose.Types.ObjectId(assignmentId),
        studentId: new mongoose.Types.ObjectId(studentId)
      }).lean()
    ]);

    const submission = studentAssignment
      ? {
          status: studentAssignment.status,
          submissionDate: studentAssignment.submissionDate,
          grade: studentAssignment.grade,
          feedback: studentAssignment.feedback,
          isLate: studentAssignment.isLate
        }
      : null;

    const uploadDetails = uploads.map((upload) => ({
      fileName: upload.fileName,
      fileUrl: upload.fileUrl,
      fileSize: upload.fileSize,
      fileType: upload.fileType,
      uploadedAt: upload.uploadedAt
    }));

    return res.status(200).json({
      submission,
      uploads: uploadDetails,
      message: 'Submission history retrieved successfully.'
    });
  } catch (error) {
    console.error('Error in getSubmissionHistory:', error);
    return res.status(500).json({ message: 'Server error. Could not retrieve submission history.' });
  }
};