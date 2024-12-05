const express = require('express');
const authController = require('../controlers/authController.js');

const router = express.Router();

// Route for login and JWT generation
router.post('/login', authController.login);


module.exports = router;