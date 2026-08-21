const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById, updateEvent, cancelEvent } = require('../controllers/eventController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authenticateToken, authorizeRoles('ORGANISER', 'ADMIN'), createEvent);
router.put('/:id', authenticateToken, authorizeRoles('ORGANISER', 'ADMIN'), updateEvent);
router.delete('/:id', authenticateToken, authorizeRoles('ORGANISER', 'ADMIN'), cancelEvent);

module.exports = router;
