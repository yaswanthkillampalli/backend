const User = require('../models/User');
const Student = require('../models/Student');

exports.getProfileDetails = async (req, res) => {
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
                    address: 1,
                    enrollmentDate: 1,
                    program: 1,
                    branch: 1,
                    branchcode: 1,
                    currentSemester: 1,
                    imageurl: 1
                }
            }
        ]);

        const profile = studentResult[0];

        if (!profile) {
            return res.status(404).json({ message: 'Student details not found for the associated ID.' });
        }

        return res.status(200).json({
            profile,
            message: "Student details retrieved successfully."
        });

    } catch (error) {
        console.error("Error in getStudentDetails:", error);
        return res.status(500).json({ message: 'Server error. Could not retrieve student details.' });
    }
};
exports.getPersonalProfileDetails = async (req, res) => {
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
                    contact: 1
                }
            }
        ]);

        const personal = studentResult[0];

        if (!personal) {
            return res.status(404).json({ message: 'Student details not found for the associated ID.' });
        }

        return res.status(200).json({
            personal,
            message: "Student details retrieved successfully."
        });

    } catch (error) {
        console.error("Error in getStudentDetails:", error);
        return res.status(500).json({ message: 'Server error. Could not retrieve student details.' });
    }
};
exports.getParentDetails = async (req, res) => {
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
                    parents : 1
                }
            }
        ]);

        const parent = studentResult[0];

        if (!parent) {
            return res.status(404).json({ message: 'Student details not found for the associated ID.' });
        }

        return res.status(200).json({
            parent,
            message: "Student details retrieved successfully."
        });

    } catch (error) {
        console.error("Error in getStudentDetails:", error);
        return res.status(500).json({ message: 'Server error. Could not retrieve student details.' });
    }
};