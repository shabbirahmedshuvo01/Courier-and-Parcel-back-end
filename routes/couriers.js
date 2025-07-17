const express = require('express');
const { getCouriers, getCourierStats } = require('../controllers/couriers');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getCouriers);
router.get('/stats', authorize('admin'), getCourierStats);

module.exports = router;
