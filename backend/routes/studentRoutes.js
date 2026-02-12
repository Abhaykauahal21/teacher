const express = require('express');
const router = express.Router();
const {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentDetails
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getStudents).post(protect, addStudent);
router.route('/:id').put(protect, updateStudent).delete(protect, deleteStudent);
router.get('/:id/details', protect, getStudentDetails);

module.exports = router;
