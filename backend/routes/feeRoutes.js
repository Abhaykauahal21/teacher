const express = require('express');
const router = express.Router();
const {
    getFees,
    addFee,
    updateFee
} = require('../controllers/feeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getFees).post(protect, addFee);
router.route('/:id').put(protect, updateFee);

module.exports = router;
