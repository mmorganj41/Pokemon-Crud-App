const router = require('express').Router();
const movesController = require('../controllers/moves');

router.post('/pokemon/:id/moves', movesController.create);
router.delete('/moves/:id', movesController.delete);
router.get('/moves/:id', movesController.show);

module.exports = router;