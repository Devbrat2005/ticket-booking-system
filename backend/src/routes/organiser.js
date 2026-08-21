const express = require('express');
const router = express.Router();
const { getOrganiserStats, getEventSummary } = require('../controllers/organiserController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.use(authenticateToken);
router.use(authorizeRoles('ORGANISER', 'ADMIN'));

router.get('/events', getOrganiserStats);
router.get('/events/:eventId/summary', getEventSummary);

module.exports = router;
