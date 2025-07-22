const User = require('../models/User');
const paginate = require('../utils/Pagination');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        // Filtering
        const queryObj = {};
        if (req.query.name) {
            queryObj.name = { $regex: req.query.name, $options: 'i' };
        }
        if (req.query.email) {
            queryObj.email = { $regex: req.query.email, $options: 'i' };
        }
        if (req.query.role && req.query.role !== "all") {
            queryObj.role = req.query.role;
        }
        if (typeof req.query.isActive !== "undefined" && req.query.isActive !== "all") {
            queryObj.isActive = req.query.isActive === "true" || req.query.isActive === true;
        }

        // Pagination options
        const options = {
            page: req.query.page,
            limit: req.query.limit,
            sort: req.query.sort,
        };

        const result = await paginate(User, queryObj, options);

        // Remove password from results
        result.data = result.data.map(user => {
            user.password = undefined;
            return user;
        });

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Make sure user can only see their own profile unless admin
        if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUsers,
    getUser,
    updateUser,
    deleteUser
};
