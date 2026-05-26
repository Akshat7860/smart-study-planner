const express = require('express');
const router  = express.Router();
const { getSessions, createSession, completeSession, skipSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getSessions)    // GET  /api/sessions?startDate=&endDate=&subject=
  .post(createSession); // POST /api/sessions

router.put('/:id/complete', completeSession); // PUT /api/sessions/:id/complete
router.put('/:id/skip',     skipSession);     // PUT /api/sessions/:id/skip

module.exports = router;
