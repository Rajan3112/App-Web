const express = require('express');
const router = express.Router();
const { authUser, registerUser, changePassword, checkEmail, verifyOTP, resendOTP, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.route('/login').post(authUser);
router.route('/register').post(registerUser);
router.route('/change-password').post(changePassword);
router.route('/check-email').post(checkEmail);
router.route('/verify-otp').post(verifyOTP);
router.route('/resend-otp').post(resendOTP);
router.route('/update-profile').put(protect, updateProfile);

module.exports = router;