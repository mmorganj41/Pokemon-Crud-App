const router = require('express').Router();
const apiController = require('../controllers/api');

router.get('/pokemon', apiController.index);
router.get('/pokemon/:id', apiController.show);
router.get('/moves', apiController.moveIndex);
router.get('/moves/:id', apiController.moveShow);

module.exports = router;