const router = require('express').Router();
const movesController = require('../controllers/moves');

router.post('/pokemon/:id/moves', movesController.create);
router.delete('/moves/:id', movesController.delete);

module.exports = router;