const asyncHandler = require('express-async-handler');
const Batch = require('../models/Batch');

// @desc    Get batches
// @route   GET /api/batches
// @access  Private
const getBatches = asyncHandler(async (req, res) => {
    const batches = await Batch.find({ createdBy: req.user.id });
    res.status(200).json(batches);
});

// @desc    Set batch
// @route   POST /api/batches
// @access  Private
const setBatch = asyncHandler(async (req, res) => {
    if (!req.body.batchName || !req.body.classLevel || !req.body.timing || !req.body.monthlyFee) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const batch = await Batch.create({
        batchName: req.body.batchName,
        classLevel: req.body.classLevel,
        timing: req.body.timing,
        monthlyFee: req.body.monthlyFee,
        createdBy: req.user.id,
    });

    res.status(200).json(batch);
});

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private
const deleteBatch = asyncHandler(async (req, res) => {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
        res.status(400);
        throw new Error('Batch not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the batch user
    if (batch.createdBy.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await batch.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getBatches,
    setBatch,
    deleteBatch,
};
