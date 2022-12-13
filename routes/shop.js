const router = require('express').Router();
const shopController = require('../controllers/shop');
const isLoggedIn = require('../config/auth');

router.get('/', isLoggedIn, shopController.index);

module.exports = router;