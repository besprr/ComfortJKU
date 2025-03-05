const express = require('express');
const { registerUser, loginUser, refreshTokens } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshTokens);

module.exports = router;