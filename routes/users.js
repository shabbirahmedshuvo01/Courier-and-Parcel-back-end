const express = require('express');
const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes below are protected

router
    .route('/')
    .get(authorize('admin'), getUsers);

router
    .route('/:id')
    .get(getUser)
    .put(authorize('admin'), updateUser)
    .delete(authorize('admin'), deleteUser);

module.exports = router;
