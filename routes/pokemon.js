const router = require('express').Router();
const pokemonController = require('../controllers/pokemon');
const isLoggedIn = require('../config/auth');

router.get('/', pokemonController.index);
router.get('/new', isLoggedIn, pokemonController.new);
router.get('/:id', pokemonController.show);
router.post('/', isLoggedIn, pokemonController.create);
router.delete('/:id', isLoggedIn, pokemonController.delete);
router.put('/:id', isLoggedIn, pokemonController.update);
router.put('/:id/evolve', isLoggedIn, pokemonController.evolve);

module.exports = router;