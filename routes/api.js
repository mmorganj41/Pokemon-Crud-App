const router = require('express').Router();
const apiController = require('../controllers/api');

router.get('/pokemon', apiController.index);
router.get('/pokemon/:id', apiController.show);
router.get('/moves', apiController.moveIndex);
router.get('/pokemon/:id/moves/', apiController.showPokemonMoves);

module.exports = router;