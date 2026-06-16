const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

// Apply admin access checks to all routes
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/overview', adminController.getOverview);
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
