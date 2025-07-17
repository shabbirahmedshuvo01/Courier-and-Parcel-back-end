const Delivery = require('../models/Delivery');
const Parcel = require('../models/Parcel');

// @desc    Get all deliveries
// @route   GET /api/deliveries
// @access  Private/Admin
const getDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.find()
            .populate('parcel', 'trackingNumber recipient')
            .populate('courier', 'name email phone')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: deliveries.length,
            data: deliveries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single delivery
// @route   GET /api/deliveries/:id
// @access  Private
const getDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id)
            .populate('parcel', 'trackingNumber recipient sender')
            .populate('courier', 'name email phone');

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        // Check if user is authorized to view this delivery
        if (req.user.role === 'courier' && delivery.courier._id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.status(200).json({
            success: true,
            data: delivery
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new delivery
// @route   POST /api/deliveries
// @access  Private/Admin
const createDelivery = async (req, res) => {
    try {
        const { parcelId, courierId, pickupDate } = req.body;

        // Check if parcel exists and is ready for delivery
        const parcel = await Parcel.findById(parcelId);
        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found' });
        }

        if (parcel.status !== 'pending') {
            return res.status(400).json({ message: 'Parcel is not ready for delivery assignment' });
        }

        // Create delivery
        const delivery = await Delivery.create({
            parcel: parcelId,
            courier: courierId,
            pickupDate,
            estimatedDelivery: parcel.shipping.estimatedDelivery
        });

        // Update parcel status and assign courier
        await Parcel.findByIdAndUpdate(parcelId, {
            status: 'picked_up',
            assignedCourier: courierId
        });

        const populatedDelivery = await Delivery.findById(delivery._id)
            .populate('parcel', 'trackingNumber recipient')
            .populate('courier', 'name email phone');

        res.status(201).json({
            success: true,
            data: populatedDelivery
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update delivery
// @route   PUT /api/deliveries/:id
// @access  Private (Admin/Courier)
const updateDelivery = async (req, res) => {
    try {
        let delivery = await Delivery.findById(req.params.id);

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        // Check if courier is authorized to update this delivery
        if (req.user.role === 'courier' && delivery.courier.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        delivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('parcel', 'trackingNumber recipient')
            .populate('courier', 'name email phone');

        res.status(200).json({
            success: true,
            data: delivery
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get courier's deliveries
// @route   GET /api/deliveries/my-deliveries
// @access  Private/Courier
const getMyCourierDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.find({ courier: req.user.id })
            .populate('parcel', 'trackingNumber recipient')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: deliveries.length,
            data: deliveries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update delivery status
// @route   PUT /api/deliveries/:id/status
// @access  Private/Courier
const updateDeliveryStatus = async (req, res) => {
    try {
        const { status, location, notes, deliveryProof } = req.body;

        const delivery = await Delivery.findById(req.params.id);

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        // Check if courier owns this delivery
        if (delivery.courier.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update delivery status
        delivery.status = status;

        // Add to route history
        delivery.route.push({
            location: location || 'Unknown Location',
            status,
            timestamp: new Date()
        });

        // If delivered, add delivery proof and actual delivery date
        if (status === 'delivered') {
            delivery.actualDelivery = new Date();
            if (deliveryProof) {
                delivery.deliveryProof = deliveryProof;
            }
        }

        // If failed delivery, increment attempts
        if (status === 'failed') {
            delivery.attempts += 1;
            delivery.failureReason = notes;
        }

        await delivery.save();

        // Update parcel status
        const parcelStatus = {
            'picked_up': 'picked_up',
            'in_transit': 'in_transit',
            'delivered': 'delivered',
            'failed': 'out_for_delivery',
            'returned': 'cancelled'
        };

        await Parcel.findByIdAndUpdate(delivery.parcel, {
            status: parcelStatus[status]
        });

        res.status(200).json({
            success: true,
            data: delivery
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDeliveries,
    getDelivery,
    createDelivery,
    updateDelivery,
    getMyCourierDeliveries,
    updateDeliveryStatus
};
