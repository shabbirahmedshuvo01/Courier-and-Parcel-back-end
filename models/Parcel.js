const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema({
    trackingNumber: {
        type: String,
        required: true,
        unique: true,
        default: function () {
            return 'PKG' + Date.now() + Math.floor(Math.random() * 1000);
        }
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, default: 'USA' }
        }
    },
    parcelDetails: {
        weight: { type: Number, required: true },
        dimensions: {
            length: { type: Number, required: true },
            width: { type: Number, required: true },
            height: { type: Number, required: true }
        },
        description: { type: String, required: true },
        value: { type: Number, required: true },
        category: {
            type: String,
            enum: ['documents', 'electronics', 'clothing', 'food', 'fragile', 'other'],
            default: 'other'
        }
    },
    shipping: {
        service: {
            type: String,
            enum: ['standard', 'express', 'overnight'],
            default: 'standard'
        },
        cost: { type: Number, required: true },
        estimatedDelivery: { type: Date, required: true }
    },
    status: {
        type: String,
        enum: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    assignedCourier: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    statusHistory: [{
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        location: { type: String },
        notes: { type: String }
    }],
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Pre-save middleware to add status to history
parcelSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
            location: 'Processing Center'
        });
    }
    next();
});

module.exports = mongoose.model('Parcel', parcelSchema);
