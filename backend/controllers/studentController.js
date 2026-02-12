const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Attendance = require('../models/Attendance');
const Fees = require('../models/Fees');

// @desc    Get students
// @route   GET /api/students
// @access  Private
const getStudents = asyncHandler(async (req, res) => {
    let query = {};
    if (req.query.batchId) {
        query.batchId = req.query.batchId;
    }

    // If we only want students for batches owned by this teacher?
    // Ideally, yes. But let's assume batchId filter implies accessing that batch.
    // Security check: Ensure the batch requested belongs to the teacher.

    if (req.query.batchId) {
        const batch = await Batch.findById(req.query.batchId);
        if (batch && batch.createdBy.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized to view this batch');
        }
    }

    const students = await Student.find(query);
    res.status(200).json(students);
});

// @desc    Add student
// @route   POST /api/students
// @access  Private
const addStudent = asyncHandler(async (req, res) => {
    const { name, phone, parentPhone, batchId } = req.body;

    if (!name || !phone || !batchId) {
        res.status(400);
        throw new Error('Please add required fields');
    }

    // Ensure batch belongs to teacher
    const batch = await Batch.findById(batchId);
    if (!batch) {
        res.status(404);
        throw new Error('Batch not found');
    }

    if (batch.createdBy.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to add student to this batch');
    }

    const student = await Student.create({
        name,
        phone,
        parentPhone,
        batchId,
    });

    res.status(200).json(student);
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // Check user authorization via batch
    const batch = await Batch.findById(student.batchId);
    if (batch.createdBy.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedStudent);
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // Check user authorization via batch
    const batch = await Batch.findById(student.batchId);
    if (batch.createdBy.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await student.deleteOne();
    // Also delete fees?
    // await Fees.deleteMany({ studentId: student._id });

    res.status(200).json({ id: req.params.id });
});

// @desc    Get student details (profile)
// @route   GET /api/students/:id/details
// @access  Private
const getStudentDetails = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id)
        .populate('batchId', 'batchName timing'); // Get batch name explicitly

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    // Check authorization (teacher owns batch)
    // We can check this via the batch document
    // Since we populated batchId, it's now an object. 
    // Wait, if populated, batchId field becomes the object.

    // We already have student.batchId populated.
    // If student has a batchId, check createdBy.
    // However, population might fail if batch doesn't exist? (Unlikely).
    // Let's be safe.

    if (!student.batchId) {
        res.status(404);
        throw new Error('Batch not found for this student');
    }

    // Mongoose population returns the document in the field.
    // So student.batchId is the Batch document.

    // We need to check if the current user (req.user.id) matches batch.createdBy
    // But wait, batch.createdBy is an ObjectId. req.user.id is String (from middleware usually).
    // Let's check safely.

    // We need to find the batch separately if we didn't populate createdBy, 
    // OR just rely on populated field. 
    // The Batch schema has `createdBy`. The populate only selected `batchName timing`. 
    // So `createdBy` is NOT in `student.batchId`.

    // Correction: I should either populate 'createdBy' too or fetch batch separately.
    // Fetching again is safer/easier to reason about or just add createdBy to populate.

    const batch = await Batch.findById(student.batchId._id);
    if (!batch || batch.createdBy.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to view this student');
    }

    // Attendance Stats - Read directly from Student model (optimized)
    const totalClasses = student.totalClasses || 0;
    const presentClasses = student.presentClasses || 0;
    const absentClasses = totalClasses - presentClasses;
    const attendancePercentage = student.attendancePercentage ? student.attendancePercentage.toFixed(1) : 0;

    // Attendance History - Fetch from Attendance Collection
    // We need to find all attendance records for this BATCH
    // and check if student was present in each.
    const attendanceRecords = await Attendance.find({
        batchId: student.batchId._id
    })
        .sort({ date: -1 })
        .limit(30);

    const attendanceHistory = attendanceRecords.map(record => ({
        _id: record._id,
        date: record.date,
        status: record.presentStudents.includes(student._id.toString()) ? 'present' : 'absent'
    }));

    // Fee Stats
    const fees = await Fees.find({ studentId: student._id }).sort({ month: -1 });

    let totalFees = 0;
    let feesPaid = 0;

    fees.forEach(fee => {
        totalFees += fee.amount;
        if (fee.status === 'paid') {
            feesPaid += fee.amount;
        }
    });

    const remainingFees = totalFees - feesPaid;

    res.status(200).json({
        student: {
            ...student.toObject(),
            batchName: student.batchId.batchName,
            batchTiming: student.batchId.timing
        },
        attendance: {
            totalClasses,
            present: presentClasses,
            absent: absentClasses,
            percentage: attendancePercentage
        },
        attendanceHistory,
        fees: {
            total: totalFees,
            paid: feesPaid,
            remaining: remainingFees,
            history: fees
        }
    });
});

module.exports = {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentDetails
};
