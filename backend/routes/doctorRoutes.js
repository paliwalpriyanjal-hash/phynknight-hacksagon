const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.get('/available', requireRole('HOSPITAL'), doctorController.getAvailableDoctors);

module.exports = router;
