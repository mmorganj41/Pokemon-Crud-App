const router = require('express').Router();
const tradesController = require('../controllers/trades');
const isLoggedIn = require('../config/auth');

router.get('/trades', isLoggedIn, tradesController.index)

module.exports = router;