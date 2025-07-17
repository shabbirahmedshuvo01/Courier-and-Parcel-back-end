const express = require('express');
const {
    getDeliveries,
    getDelivery,
    createDelivery,
    updateDelivery,
    getMyCourierDeliveries,
    updateDeliveryStatus
} = require('../controllers/deliveries');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(authorize('admin'), getDeliveries)
    .post(authorize('admin'), createDelivery);

router.get('/my-deliveries', authorize('courier'), getMyCourierDeliveries);

router
    .route('/:id')
    .get(getDelivery)
    .put(authorize('admin', 'courier'), updateDelivery);

router.put('/:id/status', authorize('courier'), updateDeliveryStatus);

module.exports = router;
