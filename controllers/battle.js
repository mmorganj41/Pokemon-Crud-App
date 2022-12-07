const Pokemon = require('../models/pokemon');
const Move = require('../models/move');
const dataFunctions = require('../config/datafunctions');

async function index(req, res, next){
	try {
		const pokemon = await Pokemon.findById(req.params.pokeid);
		const opponents = await Pokemon.find({_id: {$ne: req.params.pokeid}})
		const moves = await Move.find({pokemon: req.params.pokeid});

		pokemon.moves = moves;
		pokemon.level = dataFunctions.pokemonLevel(pokemon.experience);

		opponents.forEach((poke,i) => {
			opponents[i].level = dataFunctions.pokemonLevel(poke.experience);
		})

		res.render('battle/index', {title: 'Pokemon Battle Selection', pokemon, opponents});
	} catch(err) {
		console.log(err)
		res.send('Error loading index check terminal')
	}
}

async function show(req, res, next) {
	try {
		const pokemon = await Pokemon.findById(req.params.pokeid);
		const opponent = await Pokemon.findById(req.params.oppid);

		const pokeMoves = await Move.find({pokemon: req.params.pokeid});
		const oppMoves = await Move.find({pokemon: req.params.oppid});

		pokemon.moves = pokeMoves;
		opponent.moves = oppMoves;

		pokemon.level = dataFunctions.pokemonLevel(pokemon.experience);
		opponent.level = dataFunctions.pokemonLevel(opponent.experience);

		console.log(pokemon);

		res.render('battle/show', {title: 'Battle', pokemon, opponent})
	} catch(err) {
		console.log(err)
		res.send('error loading battle');
	}
}

module.exports = {
	index,
	show,
}