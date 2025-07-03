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
            return null; 
        }
        return user.associatedId;
    } catch (error) {
        console.error("Error fetching student ID from user:", error);
        return null;
    }
};


exports.getStudentDetails = async (req, res) => {
    try {
        const userObjectId = req.user.id;

        const studentObjectId = await getStudentIdFromUserObjectId(userObjectId);
        if (!studentObjectId) {
            return res.status(403).json({ message: 'Access denied: Not a valid student user or association missing.' });
        }

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
        const userId = req.user.id; 
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
        const userObjectId = req.user.id; 

        const studentObjectId = await getStudentIdFromUserObjectId(userObjectId);
        if (!studentObjectId) {
            return res.status(403).json({ message: 'Access denied: Not a valid student user or association missing.' });
        }

        const registeredCourses = await Enrollment.aggregate([
            {
                $match: {
                    studentId: studentObjectId,
                    status: "Enrolled"
                }
            },
            {
                $lookup: {
                    from: 'courses',      
                    localField: 'courseId',
                    foreignField: '_id',   
                    as: 'courseDetails'    
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

exports.getAttendence = async (req, res) => {
    try {
        const userObjectId = req.user.id;
        const studentObjectId = await getStudentIdFromUserObjectId(userObjectId);

        if (!studentObjectId) {
            return res.status(403).json({ message: 'Access denied: Not a valid student user or association missing.' });
        }

        const studentDetails = await Student.findById(studentObjectId).lean();
        const studendId = studentDetails.studentId;
        const currentSemester = studentDetails.currentSemester;
        const attendancePercentage = await Attendece

    } catch (error) {
        console.error("Error in getAttendence:", error);
        return res.status(500).json({ message: 'Server error. Could not retrieve attendance.' });
    }
}