const User = require('../models/User');
const Parcel = require('../models/Parcel');

// @desc    Get all couriers
// @route   GET /api/couriers
// @access  Private/Admin
const getCouriers = async (req, res) => {
    try {
        const couriers = await User.find({ role: 'courier' }).select('-password');

        res.status(200).json({
            success: true,
            count: couriers.length,
            data: couriers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get courier statistics
// @route   GET /api/couriers/stats
// @access  Private/Admin
const getCourierStats = async (req, res) => {
    try {
        const couriers = await User.find({ role: 'courier' }).select('-password');

        const stats = await Promise.all(
            couriers.map(async (courier) => {
                const assignedParcels = await Parcel.countDocuments({
                    assignedCourier: courier._id
                });

                const deliveredParcels = await Parcel.countDocuments({
                    assignedCourier: courier._id,
                    status: 'delivered'
                });

                const inTransitParcels = await Parcel.countDocuments({
                    assignedCourier: courier._id,
                    status: { $in: ['picked_up', 'in_transit', 'out_for_delivery'] }
                });

                return {
                    courier: {
                        id: courier._id,
                        name: courier.name,
                        email: courier.email,
                        phone: courier.phone
                    },
                    assignedParcels,
                    deliveredParcels,
                    inTransitParcels,
                    deliveryRate: assignedParcels > 0 ? (deliveredParcels / assignedParcels * 100).toFixed(2) : 0
                };
            })
        );

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCouriers,
    getCourierStats
};
