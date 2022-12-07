const router = require('express').Router();
const pokemonController = require('../controllers/pokemon');
const isLoggedIn = require('../config/auth');

router.get('/', pokemonController.index);
router.get('/new', isLoggedIn, pokemonController.new);
router.get('/:id', pokemonController.show);
router.post('/', pokemonController.create);

module.exports = router;