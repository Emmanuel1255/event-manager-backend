// server/models/participant.model.js
const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true
    },
    events: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }],
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkInTime: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

module.exports = mongoose.model('Participant', participantSchema);