const router = require('express').Router();
const battleController = require('../controllers/battle');

router.get('/pokemon/:pokeid/battle', battleController.index);
router.get('/pokemon/:pokeid/battle/random', battleController.random);
router.get('/pokemon/:pokeid/battle/:oppid', battleController.show);

module.exports = router;