const express = require('express');
const router  = express.Router();
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');

router.use(protect); // All subject routes require a valid JWT

router.route('/')
  .get(getSubjects)    // GET  /api/subjects
  .post(createSubject); // POST /api/subjects

router.route('/:id')
  .put(updateSubject)    // PUT    /api/subjects/:id
  .delete(deleteSubject); // DELETE /api/subjects/:id

module.exports = router;
