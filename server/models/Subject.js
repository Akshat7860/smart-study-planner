const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name:  { type: String, required: [true, 'Subject name is required'], trim: true },
    color: { type: String, default: '#6366f1' },  // Used for calendar color coding
    icon:  { type: String, default: '📚' },

    weeklyGoalHours: { type: Number, default: 5, min: 0.5, max: 40 },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    examDate:          { type: Date,   default: null },
    totalHoursStudied: { type: Number, default: 0 },
    isActive:          { type: Boolean, default: true }, // Soft delete flag
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
