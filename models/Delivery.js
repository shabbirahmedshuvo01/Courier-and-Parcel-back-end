const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    parcel: {
        type: mongoose.Schema.ObjectId,
        ref: 'Parcel',
        required: true
    },
    courier: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    pickupDate: {
        type: Date,
        required: true
    },
    deliveryDate: {
        type: Date
    },
    estimatedDelivery: {
        type: Date,
        required: true
    },
    actualDelivery: {
        type: Date
    },
    route: [{
        location: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        status: { type: String, required: true }
    }],
    deliveryProof: {
        signature: { type: String },
        photo: { type: String },
        recipientName: { type: String },
        notes: { type: String }
    },
    status: {
        type: String,
        enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned'],
        default: 'assigned'
    },
    attempts: {
        type: Number,
        default: 0,
        max: 3
    },
    failureReason: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Delivery', deliverySchema);
