// server/routes/auth.routes.js
const express = require('express');
const { check } = require('express-validator');
const { register, login } = require('../controllers/auth.controller');

const router = express.Router();

// Validation middleware
const registerValidation = [
  check('name', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('phone', 'Phone number is required').notEmpty(),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

module.exports = router;