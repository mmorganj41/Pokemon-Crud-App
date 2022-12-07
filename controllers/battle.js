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

		res.render('battle/index', {title: 'All Pokemon', pokemon, opponents});
	} catch(err) {
		console.log(err)
		res.send('Error loading index check terminal')
	}
}

module.exports = {
	index
}