const express = require('express');
const feedController = require('../controllers/feed.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', feedController.getFeed);

module.exports = router;
