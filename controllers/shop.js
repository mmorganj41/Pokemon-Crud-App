const Pokemon = require('../models/pokemon');
const Move = require('../models/move');
const dataFunctions = require('../config/datafunctions');
const axios = require('axios');
const User = require('../models/user');
const pokeAPIURL = "https://pokeapi.co/api/v2/";

async function index(req, res, next) {
	try {
		if (!req.user?.currentPokemon) return res.redirect('/');

		const pokemon = await Pokemon.findById(req.user.currentPokemon);

		pokemon.level = dataFunctions.pokemonLevel(pokemon.experience);

		const pokemonQuery = await axios({
			method: 'get',
			url: `${pokeAPIURL}pokemon/${pokemon.name}`,
	  		headers: {'accept-encoding': 'json'},
		});

		const moves = await Move.find({pokemon: pokemon._id});
		pokemon.moves = moves;
		const moveNames = moves.map(move => move.name);

		const moveOptions = pokemonQuery.data.moves.reduce((filtered, moveData) => {
			const index = moveData.version_group_details.findIndex(details => {
				return details.version_group.name === "emerald";
			})

			if (index >= 0) {
				const learnMethod = moveData.version_group_details[index].move_learn_method.name;
				const levelLearned = moveData.version_group_details[index].level_learned_at;
				const moveName = moveData.move.name;
		
				if (!(moveNames.includes(moveName)) && levelLearned <= pokemon.level && !['egg', 'level-up'].includes(learnMethod)) {
					filtered.push(moveData.move);
				}
			}
			return filtered;
		}, [])

		pokemon.moveOptions = moveOptions;

	 	res.render('pokemon/shop', {title: 'Shop', pokemon})
	} catch(err) {
		console.log(err);
		res.send('Error displaying shop');
	}
}

module.exports = {
	index,
}