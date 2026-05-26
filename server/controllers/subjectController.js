const Subject = require('../models/Subject');

// GET /api/subjects — fetch all active subjects for the logged-in user
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id, isActive: true }).sort('-createdAt');
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/subjects — create a new subject
const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/subjects/:id — update a subject
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, // Ensure user owns this subject
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/subjects/:id — soft-delete (set isActive: false)
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
