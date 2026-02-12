const asyncHandler = require('express-async-handler');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const Fees = require('../models/Fees');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    // 1. Get Counts
    const teacherId = req.user._id;

    // Find batches created by teacher
    const batches = await Batch.find({ createdBy: teacherId });
    const batchIds = batches.map(b => b._id);

    const totalBatches = batches.length;

    // Find students in those batches
    const students = await Student.find({ batchId: { $in: batchIds } });
    const totalStudents = students.length;

    // 2. Financials for Current Month
    const date = new Date();
    const currentMonth = date.toISOString().slice(0, 7); // YYYY-MM

    // Calculate Expected Revenue
    // Iterate students and sum their batch's fee
    // Better way: Create a map of batchId -> fee first
    const batchFeeMap = {};
    batches.forEach(b => {
        batchFeeMap[b._id.toString()] = b.monthlyFee;
    });

    let totalExpected = 0;
    students.forEach(s => {
        // Only active students? Assuming all for now or check s.status
        if (s.status === 'active') {
            totalExpected += (batchFeeMap[s.batchId.toString()] || 0);
        }
    });

    // Calculate Collected Revenue
    const fees = await Fees.find({
        batchId: { $in: batchIds },
        month: currentMonth,
        status: 'paid'
    });

    const totalCollected = fees.reduce((acc, curr) => acc + curr.amount, 0);

    const totalPending = totalExpected - totalCollected;

    res.status(200).json({
        totalBatches,
        totalStudents,
        financials: {
            month: currentMonth,
            expected: totalExpected,
            collected: totalCollected,
            pending: totalPending > 0 ? totalPending : 0
            // totalPending could be negative if we collected extra or for non-active students? 
            // Let's keep it simple.
        }
    });
});

module.exports = {
    getDashboardStats
};
