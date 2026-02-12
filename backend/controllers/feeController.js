const asyncHandler = require('express-async-handler');
const Fees = require('../models/Fees');
const Batch = require('../models/Batch');
const Student = require('../models/Student');

// @desc    Get fees
// @route   GET /api/fees
// @access  Private
const getFees = asyncHandler(async (req, res) => {
    const { batchId, month } = req.query;

    let query = {};
    if (batchId) query.batchId = batchId;
    if (month) query.month = month;

    // Authorization: if batchId is provided, check ownership.
    // If not provided, we might be fetching all fees for all batches of the teacher.
    // To do that efficiently without batch list, we'd need to first find all batches of this teacher.

    const teacherBatches = await Batch.find({ createdBy: req.user.id }).select('_id');
    const batchIds = teacherBatches.map(b => b._id);

    // Constrain query to batches owned by teacher
    query.batchId = { $in: batchIds };

    // If specific batch requested, ensure it's in the list
    if (batchId) {
        if (!batchIds.some(id => id.toString() === batchId)) {
            res.status(401);
            throw new Error('Not authorized to view fees for this batch');
        }
        query.batchId = batchId; // Reset to specific ID
    }

    const fees = await Fees.find(query).populate('studentId', 'name phone').sort({ month: -1 });

    res.status(200).json(fees);
});

// @desc    Add fee record
// @route   POST /api/fees
// @access  Private
const addFee = asyncHandler(async (req, res) => {
    const { studentId, batchId, month, amount, status } = req.body;

    if (!studentId || !batchId || !month || !amount) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Validate batch ownership
    const batch = await Batch.findById(batchId);
    if (!batch || batch.createdBy.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // Check for duplicate
    const feeExists = await Fees.findOne({ studentId, month });
    if (feeExists) {
        res.status(400);
        throw new Error('Fee record already exists for this month');
    }

    const fee = await Fees.create({
        studentId,
        batchId,
        month,
        amount,
        status: status || 'unpaid',
        paymentDate: status === 'paid' ? Date.now() : null
    });

    res.status(200).json(fee);
});

// @desc    Update fee status
// @route   PUT /api/fees/:id
// @access  Private
const updateFee = asyncHandler(async (req, res) => {
    const fee = await Fees.findById(req.params.id);

    if (!fee) {
        res.status(404);
        throw new Error('Fee record not found');
    }

    // Check ownership
    const batch = await Batch.findById(fee.batchId);
    if (batch.createdBy.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const updatedFee = await Fees.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Update payment date if status changed to paid
    if (req.body.status === 'paid' && !fee.paymentDate) {
        updatedFee.paymentDate = Date.now();
        await updatedFee.save();
    }

    res.status(200).json(updatedFee);
});

module.exports = {
    getFees,
    addFee,
    updateFee
};
