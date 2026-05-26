const express = require('express');
const router  = express.Router();
const { register, login, getMe, updatePreferences } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',      register);
router.post('/login',         login);
router.get('/me',             protect, getMe);               // Protected — needs token
router.put('/preferences',    protect, updatePreferences);   // Protected — needs token

module.exports = router;
