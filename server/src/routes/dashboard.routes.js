const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);

module.exports = router;
