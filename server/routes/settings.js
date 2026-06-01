const express = require('express');
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/',  settingsController.getSettings);
router.put('/',  settingsController.updateSettings);

module.exports = router;
