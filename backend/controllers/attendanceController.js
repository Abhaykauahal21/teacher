const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Batch = require('../models/Batch');

// @desc    Check attendance status
// @route   GET /api/attendance/status
// @access  Private
const checkAttendanceStatus = asyncHandler(async (req, res) => {
    const { batchId, date } = req.query;

    if (!batchId) {
        res.status(400);
        throw new Error('Batch ID is required');
    }

    const checkDate = date ? new Date(date) : new Date();
    // Normalize date to start of day for comparison
    const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));

    const attendance = await Attendance.findOne({
        batchId,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    if (attendance) {
        res.json({
            status: 'taken',
            attendance
        });
    } else {
        res.json({
            status: 'not_taken'
        });
    }
});

// @desc    Mark attendance for a batch
// @route   POST /api/attendance/mark
// @access  Private
const markAttendance = asyncHandler(async (req, res) => {
    const { batchId, date, presentStudents } = req.body;

    if (!batchId || !date) {
        res.status(400);
        throw new Error('Please provide batchId and date');
    }

    // Normalize date for strict daily checking
    const attendanceDate = new Date(date);
    const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

    // Check if attendance already exists for this batch and date
    const existingAttendance = await Attendance.findOne({
        batchId,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    if (existingAttendance) {
        // Return 200 with status instead of 400 error to allow frontend handling
        return res.status(200).json({
            alreadyTaken: true,
            attendanceId: existingAttendance._id,
            message: 'Attendance already marked for this date'
        });
    }

    // Verify batch ownership
    const batch = await Batch.findById(batchId);
    if (!batch) {
        res.status(404);
        throw new Error('Batch not found');
    }

    if (batch.createdBy.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to mark attendance for this batch');
    }

    // 1. Create Attendance Record
    const attendance = await Attendance.create({
        batchId,
        date: attendanceDate,
        presentStudents,
        createdBy: req.user._id
    });

    // 2. Update Student Stats
    const students = await Student.find({ batchId, status: 'active' });

    const bulkOps = students.map(student => {
        const isPresent = presentStudents.includes(student._id.toString());
        const newTotal = (student.totalClasses || 0) + 1;
        const newPresent = (student.presentClasses || 0) + (isPresent ? 1 : 0);
        const newPercentage = newTotal === 0 ? 0 : ((newPresent / newTotal) * 100);

        return {
            updateOne: {
                filter: { _id: student._id },
                update: {
                    $set: {
                        totalClasses: newTotal,
                        presentClasses: newPresent,
                        attendancePercentage: newPercentage
                    }
                }
            }
        };
    });

    if (bulkOps.length > 0) {
        await Student.bulkWrite(bulkOps);
    }

    res.status(201).json(attendance);
});

// @desc    Update attendance
// @route   PUT /api/attendance/update/:id
// @access  Private
const updateAttendance = asyncHandler(async (req, res) => {
    const { presentStudents } = req.body;
    const attendanceId = req.params.id;

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
        res.status(404);
        throw new Error('Attendance record not found');
    }

    // Verify batch ownership
    const batch = await Batch.findById(attendance.batchId);
    if (batch.createdBy.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update attendance');
    }

    const oldPresentStudents = attendance.presentStudents.map(id => id.toString());
    const newPresentStudents = presentStudents;

    // Update Attendance Record
    attendance.presentStudents = newPresentStudents;
    await attendance.save();

    // Recalculate Student Stats
    // We only update presentClasses, totalClasses remains same (since it's an update for the same day)
    const students = await Student.find({ batchId: attendance.batchId, status: 'active' });

    const bulkOps = students.map(student => {
        const wasPresent = oldPresentStudents.includes(student._id.toString());
        const isPresent = newPresentStudents.includes(student._id.toString());

        if (wasPresent === isPresent) return null; // No change for this student

        let newPresentCount = student.presentClasses || 0;
        if (wasPresent && !isPresent) newPresentCount--; // Changed from Present to Absent
        if (!wasPresent && isPresent) newPresentCount++; // Changed from Absent to Present

        const total = student.totalClasses || 0;
        const newPercentage = total === 0 ? 0 : ((newPresentCount / total) * 100);

        return {
            updateOne: {
                filter: { _id: student._id },
                update: {
                    $set: {
                        presentClasses: newPresentCount,
                        attendancePercentage: newPercentage
                    }
                }
            }
        };
    }).filter(op => op !== null); // Filter out nulls

    if (bulkOps.length > 0) {
        await Student.bulkWrite(bulkOps);
    }

    res.json({ message: 'Attendance updated successfully', attendance });
});

module.exports = {
    markAttendance,
    checkAttendanceStatus,
    updateAttendance
};
