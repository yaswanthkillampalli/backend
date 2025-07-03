const User = require('../models/User');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Mark = require('../models/Mark');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');
const AcademicYear = require('../models/AcademicYear');
const Calendar = require('../models/Calendar');
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

function getstudentAcademicYearField(currentSemester) {
    switch (currentSemester) {
        case 1:
            return 'firstYear';
        case 2:
            return 'firstYear';
        case 3:
            return 'secondYear';
        case 4:
            return 'secondYear';
        case 5:
            return 'thirdYear';
        case 6:
            return 'thirdYear';
        case 7:
            return 'fourthYear';
        case 8:
            return 'fourthYear';
        default:
            throw new Error('Invalid semester number');
    }
}
async function getSemesterStartAndEndDates(currentSemester) {
  const semesterDataResult = await AcademicYear.findOne(
    { 'semesters.semesterName': `Semester ${currentSemester}` },
    {
      $project: {
        _id: 0, // Exclude the document's main _id
        semesterDetails: { // Rename to something more descriptive if preferred
          $filter: {
            input: '$semesters',
            as: 'sem',
            cond: { $eq: ['$$sem.semesterName', `Semester ${currentSemester}`] }
          }
        }
      }
    }
  );

  let academicStartDate = null;
  let academicEndDateFromDB = null; // Storing the direct value from DB
  let endDateStatus = null;
  let calculationEndDate = null; // The final date to use for calculations

  if (semesterDataResult && semesterDataResult.semesterDetails.length > 0) {
    const semester = semesterDataResult.semesterDetails[0];
    academicStartDate = semester.academicStartDate;
    academicEndDateFromDB = semester.academicEndDate;
    endDateStatus = semester.endDateStatus;

    // Determine the actual end date for calculations based on status and DB value
    if (endDateStatus === 'Pending' || academicEndDateFromDB === null) {
      calculationEndDate = new Date(); // Use current date for pending/null end dates
    } else if (endDateStatus === 'Completed' && academicEndDateFromDB instanceof Date) {
      calculationEndDate = academicEndDateFromDB; // Use the stored academicEndDate for completed semesters
    }
  }

  // Return both the actual academic start date and the determined calculation end date
  return { academicStartDate, calculationEndDate };
}

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

exports.getAttendenceDays = async (req, res) => {
    try {
        const userObjectId = req.user.id;
        const studentProfile = await getStudentIdFromUserObjectId(userObjectId);

        if (!studentProfile || !studentProfile.associate_id) {
            return res.status(403).json({ message: 'Access denied: Not a valid student user or association missing.' });
        }

        const studentDetails = await Student.findById(studentProfile._id).lean();
        const studentAssociateId = studentDetails.associate_id;
        const currentSemester = studentDetails.currentSemester;
        const studentAcademicYearNumber = studentDetails.academicYear; 
        
        const { academicStartDate, calculationEndDate } = await getSemesterStartAndEndDates(currentSemester);

        if (!academicStartDate || !calculationEndDate) {
            return res.status(404).json({ message: 'Semester start or end date could not be determined.' });
        }

        const attendanceRecordsCount = await Attendance.countDocuments({
            associate_id: studentAssociateId,
            attendance_date: {
                $gte: academicStartDate,
                $lte: calculationEndDate
            },
            attendance_mark: { $in: ['Present', 'Late'] }
        });

        const studentAcademicYearField = getstudentAcademicYearField(studentAcademicYearNumber); 

        const totalWorkingDays = await Calendar.countDocuments({
            date: {
                $gte: academicStartDate,
                $lte: calculationEndDate
            },
            [`type.${studentAcademicYearField}`]: 'Working Day'
        });

        let attendancePercentage = 0;
        if (totalWorkingDays > 0) {
            attendancePercentage = (attendanceRecordsCount / totalWorkingDays) * 100;
        }

        return res.status(200).json({
            message: 'Attendance details retrieved successfully.',
            studentAssociateId: studentAssociateId,
            currentSemester: currentSemester,
            academicStartDate: academicStartDate,
            calculationEndDate: calculationEndDate,
            attendanceRecordsCount: attendanceRecordsCount,
            totalWorkingDays: totalWorkingDays,
            attendancePercentage: attendancePercentage.toFixed(2)
        });

    } catch (error) {
        console.error("Error in getAttendenceDays:", error);
        return res.status(500).json({ message: 'Server error. Could not retrieve attendance.' });
    }
};