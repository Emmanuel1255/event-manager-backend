// server/routes/participant.routes.js
const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/auth.middleware');
const {
  getParticipants,
  getParticipantsByEvent,
  getParticipant,
  createParticipant,
  updateParticipant,
  deleteParticipant,
  checkInParticipant,
  bulkImport
} = require('../controllers/participant.controller');

const router = express.Router();

// Validation middleware
const participantValidation = [
  check('name').notEmpty().withMessage('Name is required').trim(),
  check('email').isEmail().withMessage('Invalid email format').trim(),
  check('phone').notEmpty().withMessage('Phone number is required').trim()
];

// Routes
router.get('/', protect, getParticipants);
router.get('/events/:eventId/attendance', protect, getParticipantsByEvent); // Add this line
router.get('/:id', protect, getParticipant);
router.post('/', protect, participantValidation, createParticipant);
router.put('/:id', protect, participantValidation, updateParticipant);
router.delete('/:id', protect, deleteParticipant);
router.post('/:id/check-in', protect, checkInParticipant);
router.post('/bulk-import', protect, bulkImport);
router.get('/event/:eventId', protect, getParticipantsByEvent);

module.exports = router;