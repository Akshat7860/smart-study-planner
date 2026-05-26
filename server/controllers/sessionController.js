const Session = require('../models/Session');
const Subject = require('../models/Subject');
const User    = require('../models/User');

// GET /api/sessions — optionally filtered by date range or subject
const getSessions = async (req, res) => {
  try {
    const { startDate, endDate, subject } = req.query;
    const filter = { user: req.user._id };

    if (startDate && endDate)
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    if (subject) filter.subject = subject;

    const sessions = await Session.find(filter)
      .populate('subject', 'name color icon')
      .sort('date');
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/sessions — plan a new study session
const createSession = async (req, res) => {
  try {
    const session = await Session.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/sessions/:id/complete — mark a session as done + update streak
const completeSession = async (req, res) => {
  try {
    const { actualDuration, notes, mood, pomodoroCount } = req.body;

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'completed', actualDuration, notes, mood, pomodoroCount },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Add hours to the subject's running total
    await Subject.findByIdAndUpdate(session.subject, {
      $inc: { totalHoursStudied: actualDuration / 60 },
    });

    // ── Streak logic ──────────────────────────────────────────────────────
    const user = await User.findById(req.user._id);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const last  = user.streak.lastStudyDate ? new Date(user.streak.lastStudyDate) : null;
    if (last) last.setHours(0, 0, 0, 0);

    const studiedToday     = last && last.getTime() === today.getTime();
    const studiedYesterday = last && (today - last) === 86_400_000; // 24h in ms

    if (!studiedToday) {
      user.streak.current       = studiedYesterday ? user.streak.current + 1 : 1;
      user.streak.longest       = Math.max(user.streak.longest, user.streak.current);
      user.streak.lastStudyDate = today;
      await user.save();
    }

    res.json({ success: true, data: session, streak: user.streak });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/sessions/:id/skip — mark a session as skipped
const skipSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'skipped' },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSessions, createSession, completeSession, skipSession };
