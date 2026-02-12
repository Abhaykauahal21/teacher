const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Batch',
    },
    date: {
        type: Date,
        required: true,
    },
    presentStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Teacher',
    },
}, {
    timestamps: true,
});

// Ensure one attendance record per batch per day (Unique)
attendanceSchema.index({ batchId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
