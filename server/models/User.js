const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never returned in queries unless explicitly asked
    },
    preferences: {
      studyStartTime:  { type: String, default: '08:00' },
      studyEndTime:    { type: String, default: '22:00' },
      sessionLength:   { type: Number, default: 50 },  // minutes
      breakLength:     { type: Number, default: 10 },  // minutes
      weeklyGoalHours: { type: Number, default: 20 },
    },
    streak: {
      current:       { type: Number, default: 0 },
      longest:       { type: Number, default: 0 },
      lastStudyDate: { type: Date,   default: null },
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Hash password BEFORE saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if password changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: compare a plain password with the stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
