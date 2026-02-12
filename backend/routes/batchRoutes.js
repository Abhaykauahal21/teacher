const express = require('express');
const router = express.Router();
const {
    getBatches,
    setBatch,
    deleteBatch,
} = require('../controllers/batchController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBatches).post(protect, setBatch);
router.route('/:id').delete(protect, deleteBatch);

module.exports = router;
