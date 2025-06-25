const User = require('../models/User');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Mark = require('../models/Mark');
const Enrollment = require('../models/Enrollment');
const mongoose = require('mongoose');

// helper functions

const getStudentIdFromUserObjectId = async (userObjectId) => {
    try {
        const user = await User.findById(userObjectId);
        if (!user || user.role !== 'student' || user.associatedCollection !== 'students' || !user.associatedId) {
            return null; // Not a student user or invalid association
        }
        return user.associatedId;
    } catch (error) {
        console.error("Error fetching student ID from user:", error);
        return null;
    }
};


exports.getStudentDetails = async (req, res) => {
    try {
        const userObjectId = req.user.id; // User's _id from JWT token

        // Get the actual student _id from the user's associatedId
        const studentObjectId = await getStudentIdFromUserObjectId(userObjectId);
        if (!studentObjectId) {
            return res.status(403).json({ message: 'Access denied: Not a valid student user or association missing.' });
        }

        // Find the student's details using their ObjectId
        // .lean() makes the query faster by returning a plain JavaScript object instead of a Mongoose document
        const studentDetails = await Student.findById(studentObjectId).lean();

        if (!studentDetails) {
            return res.status(404).json({ message: 'Student details not found for the associated ID.' });
        }

        return res.status(200).json({
            studentDetails: studentDetails,
            message: "Student details retrieved successfully."
        });

    } catch (error) {
        console.error("Error in getStudentDetails:", error);
        return res.status(500).json({ message: 'Server error. Could not retrieve student details.' });
    }
};


exports.getTotalCredits = async (req, res) => {
    try {
        const userId = req.user.id; // Based on your 'users' schema
        const user = await User.findById(userId);
        if (!userId) {
            return res.status(404).json({ message: 'User record not found.' });
        }
        const studentId = user.associatedId;
        const result = await Mark.aggregate([
            {
                $match: {
                    studentId: studentId,
                    gradeStatus: "Final" 
                }
            },
            {
                $group: {
                    _id: null, 
                    totalCredits: { $sum: "$creditsGained" }
                }
            }
        ]);

        const totalCredits = result.length > 0 ? result[0].totalCredits : 0;

        return res.status(200).json({
            studentId: studentId,
            totalCredits: totalCredits,
            message: 'Total credits retrieved successfully.'
        });

    } catch (error) {
        console.error("Error in getTotalCredits:", error);
        return res.status(500).json({ message: 'Server error. Could not retrieve total credits.' });
    }
};

exports.coursesRegistered = async (req, res) => {
    try {
        const userObjectId = req.user.id; // User's _id from JWT token

        const studentObjectId = await getStudentIdFromUserObjectId(userObjectId);
        if (!studentObjectId) {
            return res.status(403).json({ message: 'Access denied: Not a valid student user or association missing.' });
        }

        // Find enrollments for the student with 'Enrolled' status
        const registeredCourses = await Enrollment.aggregate([
            {
                $match: {
                    studentId: studentObjectId,
                    status: "Enrolled" // Filter by enrollment status
                }
            },
            {
                $lookup: {
                    from: 'courses',       // The collection to join with
                    localField: 'courseId', // Field from the input documents (enrollments)
                    foreignField: '_id',    // Field from the "from" documents (courses)
                    as: 'courseDetails'     // Output array field
                }
            },
            {
                $unwind: '$courseDetails' // Deconstructs the courseDetails array
            },
            {
                $project: {
                    _id: 0, // Exclude enrollment _id
                    courseId: '$courseDetails._id',
                    courseCode: '$courseDetails.courseCode',
                    courseName: '$courseDetails.courseName',
                    credits: '$courseDetails.credits',
                    academicYear: 1,
                    semester: 1,
                    enrollmentDate: 1,
                    status: 1
                }
            }
        ]);

        if (registeredCourses.length === 0) {
            return res.status(200).json({
                studentId: studentObjectId,
                courses: [],
                message: "No courses currently registered."
            });
        }

        return res.status(200).json({
            studentId: studentObjectId,
            courses: registeredCourses,
            message: "Successfully retrieved registered courses."
        });

    } catch (error) {
        console.error("Error fetching registered courses:", error);
        return res.status(500).json({ message: 'Server error. Could not retrieve registered courses.' });
    }
};

exports.coursesCompleted = async (req, res) => {
    try {
        const userObjectId = req.user.id; // User's _id from JWT token

        const studentObjectId = await getStudentIdFromUserObjectId(userObjectId);
        if (!studentObjectId) {
            return res.status(403).json({ message: 'Access denied: Not a valid student user or association missing.' });
        }

        // Find marks for the student that indicate successful completion
        const completedCourses = await Mark.aggregate([
            {
                $match: {
                    studentId: studentObjectId,
                    gradeStatus: "Final",   // Only consider finalized grades
                    creditsGained: { $gt: 0 } // Ensure credits were actually gained (i.e., passed)
                }
            },
            {
                // Group by courseId to ensure unique completed courses,
                // and pick the latest (or best) grade if a course was repeated
                $sort: { submissionDate: -1 } // Sort to get latest submission if multiple entries for same course
            },
            {
                $group: {
                    _id: "$courseId", // Group by course ID to get unique courses
                    latestMarkId: { $first: "$_id" },
                    courseId: { $first: "$courseId" },
                    gradePoint: { $first: "$gradePoint" },
                    letterGrade: { $first: "$letterGrade" },
                    creditsGained: { $first: "$creditsGained" },
                    academicYear: { $first: "$academicYear" },
                    semester: { $first: "$semester" },
                    submissionDate: { $first: "$submissionDate" }
                }
            },
            {
                $lookup: {
                    from: 'courses',        // The collection to join with
                    localField: 'courseId', // Field from the input documents (grouped marks)
                    foreignField: '_id',    // Field from the "from" documents (courses)
                    as: 'courseDetails'     // Output array field
                }
            },
            {
                $unwind: '$courseDetails' 
            },
            {
                $project: {
                    _id: 0, 
                    courseId: '$courseDetails._id',
                    courseCode: '$courseDetails.courseCode',
                    courseName: '$courseDetails.courseName',
                    totalCredits: '$courseDetails.credits', 
                    creditsGained: 1, 
                    gradePoint: 1,
                    letterGrade: 1,
                    academicYear: 1,
                    semester: 1,
                    submissionDate: 1
                }
            }
        ]);

        if (completedCourses.length === 0) {
            return res.status(200).json({
                studentId: studentObjectId,
                courses: [],
                message: "No courses completed yet."
            });
        }

        return res.status(200).json({
            studentId: studentObjectId,
            courses: completedCourses,
            message: "Successfully retrieved completed courses."
        });

    } catch (error) {
        console.error("Error fetching completed courses:", error);
        return res.status(500).json({ message: 'Server error. Could not retrieve completed courses.' });
    }
};

exports.getCurrentCGPA = async (req, res) => {
    try {
        const userObjectId = req.user.id;

        const studentObjectId = await getStudentIdFromUserObjectId(userObjectId);
        if (!studentObjectId) {
            return res.status(403).json({ message: 'Access denied: Not a valid student user or association missing.' });
        }

        const cgpaResult = await Mark.aggregate([
            {
                $match: {
                    studentId: studentObjectId,
                    gradeStatus: "Final",       
                    gradePoint: { $ne: null }  
                }
            },
            {
                $group: {
                    _id: null, 
                    averageGradePoint: { $avg: "$gradePoint" }
                }
            },
            {
                $project: {
                    _id: 0, 
                    cgpa: "$averageGradePoint" 
                }
            }
        ]);

        const cgpa = cgpaResult.length > 0 ? cgpaResult[0].cgpa : 0;

        return res.status(200).json({
            studentId: studentObjectId,
            cgpa: parseFloat(cgpa.toFixed(2)), 
            message: 'Current CGPA retrieved successfully.'
        });

    } catch (error) {
        console.error("Error in getCurrentCGPA:", error);
        return res.status(500).json({ message: 'Server error. Could not retrieve CGPA.' });
    }
};