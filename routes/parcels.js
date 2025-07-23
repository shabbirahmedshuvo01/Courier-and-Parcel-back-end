const express = require('express');
const {
    createParcel,
    getParcels,
    getParcel,
    updateParcel,
    deleteParcel,
    trackParcel,
    getMyParcels
} = require('../controllers/parcels');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/track/:trackingNumber', trackParcel);

router.use(protect); // All routes below are protected

router
    .route('/')
    .get(getParcels)
    .post(createParcel);

router.get('/my-parcels', getMyParcels);

router
    .route('/:id')
    .get(getParcel)
    .put(authorize('admin', 'courier'), updateParcel)
    .delete(authorize('admin'), deleteParcel);

router.patch('/:id/assign-agent', authorize('admin'), require('../controllers/parcels').assignAgent);

module.exports = router;
