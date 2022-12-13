const router = require('express').Router();
const shopController = require('../controllers/shop');
const isLoggedIn = require('../config/auth');

router.get('/', isLoggedIn, shopController.index);
router.put('/feed', isLoggedIn, shopController.feed);
router.put('/heal', isLoggedIn, shopController.heal);
router.post('/moves', isLoggedIn, shopController.move);

module.exports = router;