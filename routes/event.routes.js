// server/routes/event.routes.js
const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/auth.middleware');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/event.controller');

const router = express.Router();

// Validation middleware
const eventValidation = [
  check('name')
    .notEmpty()
    .withMessage('Event name is required')
    .trim(),
  check('description')
    .notEmpty()
    .withMessage('Event description is required')
    .trim(),
  check('date')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  check('location')
    .notEmpty()
    .withMessage('Event location is required')
    .trim(),
  check('capacity')
    .notEmpty()
    .withMessage('Event capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1')
];

// Routes
router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, eventValidation, createEvent);
router.put('/:id', protect, eventValidation, updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;