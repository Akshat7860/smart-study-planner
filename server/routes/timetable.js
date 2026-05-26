const express = require('express');
const router  = express.Router();
const { getTimetable, generateTimetable, addSlot, deleteSlot } = require('../controllers/timetableController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/',              getTimetable);      // GET  /api/timetable
router.post('/generate',     generateTimetable); // POST /api/timetable/generate
router.post('/slot',         addSlot);           // POST /api/timetable/slot
router.delete('/slot/:id',   deleteSlot);        // DELETE /api/timetable/slot/:id

module.exports = router;
