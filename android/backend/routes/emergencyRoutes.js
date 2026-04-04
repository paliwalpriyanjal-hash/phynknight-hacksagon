const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// USER routes
router.post('/create', requireRole('USER'), emergencyController.createEmergency);
router.get('/my', requireRole('USER'), emergencyController.getMyEmergencies);

// HOSPITAL routes
router.get('/all', requireRole('HOSPITAL'), emergencyController.getAllEmergencies);
router.patch('/:id/status', requireRole('HOSPITAL'), emergencyController.updateStatus);
router.patch('/:id/assign-doctor', requireRole('HOSPITAL'), emergencyController.assignDoctor);

module.exports = router;
