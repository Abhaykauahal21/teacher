const express = require('express');
const router = express.Router();
const { markAttendance, checkAttendanceStatus, updateAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/mark', protect, markAttendance);
router.get('/status', protect, checkAttendanceStatus);
router.put('/update/:id', protect, updateAttendance);

module.exports = router;
