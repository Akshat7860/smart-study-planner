const mongoose = require('mongoose');

// A Session = one study block (planned or completed)
const sessionSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    date:             { type: Date,   required: true },
    plannedDuration:  { type: Number, required: true },   // minutes
    actualDuration:   { type: Number, default: null },    // filled when completed
    status: {
      type: String,
      enum: ['planned', 'completed', 'skipped'],
      default: 'planned',
    },
    notes:         { type: String, default: '' },
    pomodoroCount: { type: Number, default: 0 },
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'bad', ''],
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
