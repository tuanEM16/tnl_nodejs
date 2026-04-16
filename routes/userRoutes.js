const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// Public auth routes
router.post('/auth/login', userController.login);
router.post('/auth/forgot-password', userController.forgotPassword);
router.post('/auth/reset-password', userController.resetPassword);

// Authenticated user routes
router.get('/users/profile', authMiddleware, userController.profile);
router.put('/users/profile', authMiddleware, upload.single('avatar'), userController.updateProfile);
router.post('/users/change-password', authMiddleware, userController.changePassword);

// Admin management routes (CRUD for admin accounts)
router.get('/users', authMiddleware, userController.index);
router.post('/users', authMiddleware, upload.single('avatar'), userController.store);
router.get('/users/:id', authMiddleware, userController.show);
router.put('/users/:id', authMiddleware, upload.single('avatar'), userController.update);
router.delete('/users/:id', authMiddleware, userController.destroy);

module.exports = router;