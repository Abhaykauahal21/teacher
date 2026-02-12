const mongoose = require('mongoose');

const batchSchema = mongoose.Schema({
    batchName: {
        type: String,
        required: true,
    },
    classLevel: {
        type: String, // '8', '9', '10' etc. String to allow flexibility like '12-Science'
        required: true,
    },
    timing: {
        type: String,
        required: true,
    },
    monthlyFee: {
        type: Number,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Teacher',
    },
}, {
    timestamps: true,
});

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
