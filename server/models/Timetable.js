const mongoose = require('mongoose');

// A Timetable slot = a recurring weekly study block
const timetableSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0=Sun, 1=Mon...
    startTime:   { type: String, required: true }, // "09:00"
    endTime:     { type: String, required: true }, // "10:00"
    isRecurring: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Timetable', timetableSchema);
