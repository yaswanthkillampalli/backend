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
  const result = await AcademicYear.aggregate([
    {
      $match: {
        'semesters.semesterName': `Semester ${currentSemester}` // First, find the academic year document
      }
    },
    {
      $project: {
        _id: 0,
        semesterDetails: {
          $filter: {
            input: '$semesters',
            as: 'sem',
            cond: { $eq: ['$$sem.semesterName', `Semester ${currentSemester}`] }
          }
        }
      }
    },
    {
      $unwind: { path: '$semesterDetails', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        academicStartDate: '$semesterDetails.academicStartDate',
        academicEndDate: '$semesterDetails.academicEndDate',
        endDateStatus: '$semesterDetails.endDateStatus'
      }
    }
  ]);

  let academicStartDate = null;
  let academicEndDateFromDB = null;
  let endDateStatus = null;
  let calculationEndDate = null;

  if (result.length > 0 && result[0].academicStartDate) { 
    const semester = result[0]; 
    academicStartDate = semester.academicStartDate;
    academicEndDateFromDB = semester.academicEndDate;
    endDateStatus = semester.endDateStatus;

    if (endDateStatus === 'Pending' || academicEndDateFromDB === null) {
      calculationEndDate = new Date();
    }
  }

  return { academicStartDate, calculationEndDate };
}

exports.getStudentDetails = async (req, res) => {
    try {
        const userObjectId = req.user.id;

        const user = await User.findById(userObjectId).lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.role !== 'student') {
             return res.status(403).json({ message: 'Access denied: User is not a student.' });
        }

        const studentObjectId = user.associatedId;

        if (!studentObjectId) {
            return res.status(403).json({ message: 'Access denied: User is not associated with a student.' });
        }

        const studentResult = await Student.aggregate([
            {
                $match: {
                    _id: studentObjectId
                }
            },
            {
                $project: {
                    _id: 0,
                    studentId: 1,
                    firstName: 1,
                    lastName: 1,
                    dateOfBirth: 1,
                    gender: 1,
                    contact: 1,
                    address: 1,
                    parents: 1,
                    enrollmentDate: 1,
                    program: 1,
                    branch: 1,
                    branchcode: 1,
                    currentSemester: 1,
                    updatedAt: 1,
                    imageurl: 1
                }
            }
        ]);

        const studentDetailsProjected = studentResult[0];

        if (!studentDetailsProjected) {
            return res.status(404).json({ message: 'Student details not found for the associated ID.' });
        }

        const finalCombinedDetails = {
            username: user.username,
            email: user.email,
            role: user.role,
            studentDetails: studentDetailsProjected
        };

        return res.status(200).json({
            studentDetails: finalCombinedDetails,
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
        const studentObjectId = await getStudentIdFromUserObjectId(userObjectId);
        if (!studentObjectId) {
            return res.status(403).json({ message: 'Access denied: Not a valid student user or association missing.' });
        }

        const studentDetails = await Student.findById(studentObjectId).lean();
        const studentAssociateId = studentDetails.studentId;
        const currentSemester = studentDetails.currentSemester;
        
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
        const studentAcademicYearField = getstudentAcademicYearField(currentSemester); 
        const totalWorkingDays = await Calendar.countDocuments({
            date: {
                $gte: academicStartDate,
                $lte: calculationEndDate
            },
            [`type.${studentAcademicYearField}`]: 'Working'
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

exports.getNearestExamDetails = async (req, res) => {
    try {
        const userObjectId = req.user.id;
        const studentObjectId = await getStudentIdFromUserObjectId(userObjectId);

        if (!studentObjectId) {
            return res.status(403).json({ message: 'Access denied: Not a valid student user or association missing.' });
        }

        const studentDetails = await Student.findById(studentObjectId).lean();
        if (!studentDetails) {
            return res.status(404).json({ message: 'Student details not found.' });
        }

        const currentSemester = studentDetails.currentSemester;
        const studentAcademicYearField = getstudentAcademicYearField(currentSemester);

        if (!studentAcademicYearField) {
            return res.status(400).json({ message: 'Could not determine academic year for the current semester.' });
        }

        const examTypes = ['CT-1', 'CT-2', 'CT-3', 'CT-4', 'MID-1', 'MID-2', 'SEM-END-EXAMS'];

        const nearestExam = await Calendar.aggregate([
            {
                $match: {
                    isHoliday: false,
                    "date": { $gte: new Date() } // Only documents on or after today's date
                }
            },
            {
                $project: {
                    date: "$date",
                    types: { $objectToArray: "$type" }
                }
            },
            {
                $unwind: "$types"
            },
            {
                $match: {
                    "types.v": { $in: examTypes },
                    "types.k": studentAcademicYearField // Filter for the student's specific academic year
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$date",
                    examType: "$types.v",
                    academicYear: "$types.k"
                }
            },
            {
                $sort: {
                    date: 1
                }
            },
            {
                $limit: 1
            }
        ]);

        if (nearestExam.length > 0) {
            return res.status(200).json({
                message: 'Nearest upcoming exam found.',
                nearestExam: nearestExam[0]
            });
        } else {
            return res.status(404).json({
                message: 'No upcoming exams found for your academic year.'
            });
        }

    } catch (error) {
        console.error("Error in getNearestExamDetails:", error);
        return res.status(500).json({ message: 'Server error. Could not retrieve nearest exam details.' });
    }
};

exports.getCalendarDetails = async (req,res) => {
    try {
        const userObjectId = req.user.id;
        const studentObjectId = await getStudentIdFromUserObjectId(userObjectId);

        if (!studentObjectId) {
            return res.status(403).json({ message: 'Access denied: Not a valid student user or association missing.' });
        }

        const studentDetails = await Student.findById(studentObjectId).lean();
        if (!studentDetails) {
            return res.status(404).json({ message: 'Student details not found.' });
        }

        const currentSemester = studentDetails.currentSemester;
        const studentAcademicYearField = getstudentAcademicYearField(currentSemester);
        const { academicStartDate } = await getSemesterStartAndEndDates(currentSemester);
        if (!studentAcademicYearField) {
            return res.status(400).json({ message: 'Could not determine academic year for the current semester.' });
        }
        const queryresult = await Calendar.aggregate([
            {
            $match: {
                date: {
                $gte: academicStartDate
                }
            }
            },
            {
            $addFields: {
                selectedType: `$type.${studentAcademicYearField}`
            }
            },
            {
            $project: {
                _id: 0,
                dateObj: '$date',
                id: '$id',
                type: '$selectedType',
                isHoliday: '$isHoliday',
                holidayReason: '$holidayReason'
            }
            },
            { $sort: { id: 1 } }
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
        );
        return res.status(200).json({
            message: 'Calendar details retrieved successfully.',
            calendarDetails: queryresult
        });
    } catch (error) {
        console.error("Error in getCalendarDetails:", error);
        return res.status(500).json({ message: 'Server error. Could not retrieve calendar details.' });
    }
}

