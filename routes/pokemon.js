const router = require('express').Router();
const pokemonController = require('../controllers/pokemon');

router.get('/', pokemonController.index);

module.exports = router;