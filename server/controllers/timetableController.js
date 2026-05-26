const Timetable = require('../models/Timetable');
const Subject   = require('../models/Subject');

// GET /api/timetable — all weekly slots for the user
const getTimetable = async (req, res) => {
  try {
    const slots = await Timetable.find({ user: req.user._id })
      .populate('subject', 'name color icon priority');
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/timetable/generate
 * Smart algorithm: distributes study sessions across Mon-Fri
 * based on subject priority and user time preferences.
 */
const generateTimetable = async (req, res) => {
  try {
    const { preferences } = req.user;
    const subjects = await Subject.find({ user: req.user._id, isActive: true });

    if (!subjects.length)
      return res.status(400).json({
        success: false,
        message: 'Add at least one subject before generating a timetable',
      });

    // Wipe old generated slots first
    await Timetable.deleteMany({ user: req.user._id });

    const slots = [];
    const [startH] = preferences.studyStartTime.split(':').map(Number);
    const [endH]   = preferences.studyEndTime.split(':').map(Number);
    const sessionMins = preferences.sessionLength;
    const breakMins   = preferences.breakLength;

    // Priority weight: high subjects get 3× more slots than low
    const weight = { high: 3, medium: 2, low: 1 };
    const totalW = subjects.reduce((s, sub) => s + weight[sub.priority], 0);

    for (let day = 1; day <= 5; day++) { // Mon–Fri
      let cur = startH * 60;             // current cursor in minutes from midnight
      const end = endH * 60;

      for (const sub of subjects) {
        if (cur + sessionMins > end) break;

        // Probability of scheduling this subject today is proportional to priority
        const prob = (weight[sub.priority] / totalW) * 2;
        if (Math.random() > prob) continue;

        const fmt = (mins) => {
          const h = String(Math.floor(mins / 60)).padStart(2, '0');
          const m = String(mins % 60).padStart(2, '0');
          return `${h}:${m}`;
        };

        slots.push({
          user:      req.user._id,
          subject:   sub._id,
          dayOfWeek: day,
          startTime: fmt(cur),
          endTime:   fmt(cur + sessionMins),
        });
        cur += sessionMins + breakMins;
      }
    }

    const created   = await Timetable.insertMany(slots);
    const populated = await Timetable.find({ _id: { $in: created.map((s) => s._id) } })
      .populate('subject', 'name color icon priority');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/timetable/slot — manually add a time slot
const addSlot = async (req, res) => {
  try {
    const slot      = await Timetable.create({ ...req.body, user: req.user._id });
    const populated = await slot.populate('subject', 'name color icon priority');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/timetable/slot/:id — remove a slot
const deleteSlot = async (req, res) => {
  try {
    const slot = await Timetable.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.json({ success: true, message: 'Slot removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTimetable, generateTimetable, addSlot, deleteSlot };
