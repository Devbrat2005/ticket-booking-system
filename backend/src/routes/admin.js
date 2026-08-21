const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, getSystemStats } = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/users', getUsers);
router.put('/users/:userId/role', updateUserRole);
router.get('/stats', getSystemStats);

module.exports = router;
