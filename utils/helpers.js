const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        token,
        data: user
    });
};

// Calculate delivery cost based on weight and service
const calculateShippingCost = (weight, service, distance = 100) => {
    const baseRate = {
        standard: 5.99,
        express: 12.99,
        overnight: 24.99
    };

    const weightMultiplier = Math.ceil(weight / 1) * 2; // $2 per lb
    const distanceMultiplier = Math.ceil(distance / 100) * 1.5; // $1.5 per 100 miles

    return baseRate[service] + weightMultiplier + distanceMultiplier;
};

// Calculate estimated delivery date
const calculateDeliveryDate = (service) => {
    const now = new Date();
    const deliveryDays = {
        standard: 5,
        express: 2,
        overnight: 1
    };

    const deliveryDate = new Date(now);
    deliveryDate.setDate(now.getDate() + deliveryDays[service]);

    return deliveryDate;
};

module.exports = {
    generateToken,
    sendTokenResponse,
    calculateShippingCost,
    calculateDeliveryDate
};
