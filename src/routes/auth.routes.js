const express = require('express');
const router = express.Router();
const { register, login, profile } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, profile);

module.exports = router;