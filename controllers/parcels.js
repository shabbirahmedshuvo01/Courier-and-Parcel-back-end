const Parcel = require('../models/Parcel');
const { calculateShippingCost, calculateDeliveryDate } = require('../utils/helpers');
const paginate = require('../utils/Pagination');

// @desc    Create new parcel
// @route   POST /api/parcels
// @access  Private
const createParcel = async (req, res) => {
    try {
        req.body.sender = req.user.id;

        // Calculate shipping cost and delivery date
        const { weight } = req.body.parcelDetails;
        const { service } = req.body.shipping;

        req.body.shipping.cost = calculateShippingCost(weight, service);
        req.body.shipping.estimatedDelivery = calculateDeliveryDate(service);

        const parcel = await Parcel.create(req.body);

        res.status(201).json({
            success: true,
            data: parcel
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all parcels
// @route   GET /api/parcels
// @access  Private
const getParcels = async (req, res) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Parcel.find(JSON.parse(queryStr)).populate('sender', 'name email');

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Parcel.countDocuments();

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const parcels = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: parcels.length,
            pagination,
            data: parcels
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single parcel
// @route   GET /api/parcels/:id
// @access  Private
const getParcel = async (req, res) => {
    try {
        const parcel = await Parcel.findById(req.params.id).populate('sender', 'name email');

        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found' });
        }

        // Make sure user is parcel owner or admin/courier
        if (parcel.sender._id.toString() !== req.user.id &&
            !['admin', 'courier'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.status(200).json({
            success: true,
            data: parcel
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update parcel
// @route   PUT /api/parcels/:id
// @access  Private (Admin/Courier)
const updateParcel = async (req, res) => {
    try {
        let parcel = await Parcel.findById(req.params.id);

        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found' });
        }

        parcel = await Parcel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: parcel
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete parcel
// @route   DELETE /api/parcels/:id
// @access  Private (Admin)
const deleteParcel = async (req, res) => {
    try {
        const parcel = await Parcel.findById(req.params.id);

        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found' });
        }

        await Parcel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Track parcel by tracking number
// @route   GET /api/parcels/track/:trackingNumber
// @access  Public
const trackParcel = async (req, res) => {
    try {
        const parcel = await Parcel.findOne({
            trackingNumber: req.params.trackingNumber
        }).populate('sender', 'name').populate('assignedCourier', 'name phone');

        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found with that tracking number' });
        }

        res.status(200).json({
            success: true,
            data: {
                trackingNumber: parcel.trackingNumber,
                status: parcel.status,
                statusHistory: parcel.statusHistory,
                estimatedDelivery: parcel.shipping.estimatedDelivery,
                assignedCourier: parcel.assignedCourier
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user's parcels
// @route   GET /api/parcels/my-parcels
// @access  Private
const getMyParcels = async (req, res) => {
    try {
        const result = await paginate(
            Parcel,
            { sender: req.user.id },
            { page: req.query.page, limit: req.query.limit, sort: '-createdAt' }
        );
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createParcel,
    getParcels,
    getParcel,
    updateParcel,
    deleteParcel,
    trackParcel,
    getMyParcels
};
