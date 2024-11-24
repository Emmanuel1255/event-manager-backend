// server/controllers/participant.controller.js
const Participant = require('../models/participant.model');
const Event = require('../models/event.model');
const { validationResult } = require('express-validator');

// Get all participants
exports.getParticipants = async (req, res) => {
  try {
    const { eventId, search } = req.query;
    let query = {};

    if (eventId) {
      query.events = eventId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const participants = await Participant.find(query)
      .populate('events', 'name date')
      .sort({ createdAt: -1 });

    res.status(200).json(participants);
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving participants'
    });
  }
};

exports.getParticipantsByEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const participants = await Participant.find({ events: eventId })
        .select('name email phone checkedIn checkInTime');
  
      res.status(200).json(participants);
    } catch (error) {
      console.error('Get participants error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving participants'
      });
    }
  };
  
  exports.bulkImport = async (req, res) => {
    try {
      const { eventId, participants } = req.body;
  
      // Create participants
      const createdParticipants = await Participant.insertMany(
        participants.map(p => ({
          ...p,
          events: [eventId]
        }))
      );
  
      // Update event
      await Event.findByIdAndUpdate(eventId, {
        $push: { participants: { $each: createdParticipants.map(p => p._id) } },
        $inc: { registered: createdParticipants.length }
      });
  
      res.status(201).json(createdParticipants);
    } catch (error) {
      console.error('Bulk import error:', error);
      res.status(500).json({
        success: false,
        message: 'Error importing participants'
      });
    }
  };

// Get participant by ID
exports.getParticipant = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id)
      .populate('events', 'name date location');

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    res.status(200).json(participant);
  } catch (error) {
    console.error('Get participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving participant'
    });
  }
};

// Create participant
exports.createParticipant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId } = req.body;
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
    }

    const participant = await Participant.create({
      ...req.body,
      events: eventId ? [eventId] : []
    });

    if (eventId) {
      await Event.findByIdAndUpdate(eventId, {
        $inc: { registered: 1 }
      });
    }

    res.status(201).json(participant);
  } catch (error) {
    console.error('Create participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating participant'
    });
  }
};

// Update participant
exports.updateParticipant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    res.status(200).json(participant);
  } catch (error) {
    console.error('Update participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating participant'
    });
  }
};

// Delete participant
exports.deleteParticipant = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Update event registered count
    for (const eventId of participant.events) {
      await Event.findByIdAndUpdate(eventId, {
        $inc: { registered: -1 }
      });
    }

    await participant.remove();

    res.status(200).json({
      success: true,
      message: 'Participant deleted successfully'
    });
  } catch (error) {
    console.error('Delete participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting participant'
    });
  }
};

// Check in participant
exports.checkInParticipant = async (req, res) => {
  try {
    const { eventId } = req.body;
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    if (!participant.events.includes(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Participant not registered for this event'
      });
    }

    if (participant.checkedIn) {
      return res.status(400).json({
        success: false,
        message: 'Participant already checked in'
      });
    }

    participant.checkedIn = true;
    participant.checkInTime = new Date();
    await participant.save();

    res.status(200).json({
      success: true,
      data: participant
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking in participant'
    });
  }
};

// Bulk import participants
// exports.bulkImport = async (req, res) => {
//   try {
//     const { eventId, participants } = req.body;

//     const event = await Event.findById(eventId);
//     if (!event) {
//       return res.status(404).json({
//         success: false,
//         message: 'Event not found'
//       });
//     }

//     const importedParticipants = await Participant.insertMany(
//       participants.map(p => ({
//         ...p,
//         events: [eventId]
//       }))
//     );

//     await Event.findByIdAndUpdate(eventId, {
//       $inc: { registered: importedParticipants.length }
//     });

//     res.status(201).json(importedParticipants);
//   } catch (error) {
//     console.error('Bulk import error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error importing participants'
//     });
//   }
// };