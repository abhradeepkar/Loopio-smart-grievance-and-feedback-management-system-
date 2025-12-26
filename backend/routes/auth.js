const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserProfile, getDevelopers, getAllUsers, getStandardUsers, forgotPassword, resetPassword, deleteMyAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profilePicture'), updateUserProfile);
router.delete('/me', protect, deleteMyAccount);
router.get('/developers', protect, getDevelopers);
router.get('/users', protect, getStandardUsers);

// Forgot Password
router.post('/forgotpassword', forgotPassword);

// Reset Password
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
