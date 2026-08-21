const express = require('express');
const router = express.Router();
const { createVenue, getVenues, getVenueById, updateVenue, deleteVenue } = require('../controllers/venueController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.get('/', getVenues);
router.get('/:id', getVenueById);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createVenue);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), updateVenue);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteVenue);

module.exports = router;
