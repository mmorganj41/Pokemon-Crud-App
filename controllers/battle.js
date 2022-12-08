const Pokemon = require('../models/pokemon');
const Move = require('../models/move');
const axios = require('axios');
const dataFunctions = require('../config/datafunctions');
const pokeAPIURL = "https://pokeapi.co/api/v2/";

async function index(req, res, next){
	try {
		const pokemon = await Pokemon.findById(req.params.pokeid);
		
		if (req.user?._id != String(pokemon.user)) return res.redirect(`/pokemon/${req.params.pokeid}`)

		const opponents = await Pokemon.find({_id: {$ne: req.params.pokeid}});
		const moves = await Move.find({pokemon: req.params.pokeid});

		const pokemonQuery = await axios({
			method: 'get',
			url: `${pokeAPIURL}pokemon/${pokemon.name}`,
	  		headers: {'accept-encoding': 'json'},
		});

		pokemon.moves = moves;
		const moveNames = moves.map(move => move.name);
		pokemon.level = dataFunctions.pokemonLevel(pokemon.experience);

		const moveOptions = pokemonQuery.data.moves.reduce((filtered, moveData) => {
			const learnMethod = moveData.version_group_details[0].move_learn_method.name;
			const levelLearned = moveData.version_group_details[0].level_learned_at;
			const moveName = moveData.move.name;
	
			if (!(moveNames.includes(moveName)) && levelLearned <= pokemon.Level && (learnMethod === 'egg' || learnMethod === 'level-up')) {
				filtered.push(moveData.move);
			}
			return filtered;
		}, [])

		pokemon.moveOptions = moveOptions;


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

		if (req.user?._id != String(pokemon.user)) return res.redirect(`/pokemon/${req.params.pokeid}`)

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