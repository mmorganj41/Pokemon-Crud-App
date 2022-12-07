const router = require('express').Router();
const battleController = require('../controllers/battle');

router.get('/pokemon/:pokeid/battle', battleController.index);

module.exports = router;