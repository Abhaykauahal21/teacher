const mongoose = require('mongoose');

const feeSchema = mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student',
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Batch',
    },
    month: {
        type: String, // Format: 'YYYY-MM'
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid',
    },
    paymentDate: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Compound index to ensure one fee record per student per month? 
// Or do we allow partial payments? The prompt implies "Mark fees as paid/unpaid", so maybe simple.
// "Handle edge cases (duplicate fee for same month)" -> Yes, we should probably unique it or handle it in logic.
// Let's add an index for faster queries and uniqueness if strictly one record per month.
feeSchema.index({ studentId: 1, month: 1 }, { unique: true });

const Fees = mongoose.model('Fees', feeSchema);

module.exports = Fees;
