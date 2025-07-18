const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://192.168.1.102:3000', 'http://localhost:3000'], // Allow specific origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/parcels', require('./routes/parcels'));
app.use('/api/couriers', require('./routes/couriers'));
app.use('/api/deliveries', require('./routes/deliveries'));


// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Courier and Parcel Management System API' });
});

// Database connection
// Database connection - FIXED: Removed deprecated options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/courier_management')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
