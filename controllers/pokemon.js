const Pokemon = require('../models/pokemon');
const axios = require('axios');
const pokeAPIURL = "https://pokeapi.co/api/v2/";

async function index(req, res, next) {
	try {
		const pokemon = await Pokemon.find({})
			.populate("trainer")
			.exec();

		res.render('pokemon/index', {title: 'All Pokemon', pokemon});
	} catch(err) {
		console.log(err)
		res.send('Error loading index check terminal')
	}
}

async function newPokemon(req, res, next) {
	try {
		const pokemon = await axios({
			method: 'get',
			url: `${pokeAPIURL}pokemon/?limit=151`,
	  		headers: {'accept-encoding': 'json'},
		});

		res.render('pokemon/new', {title: 'Catch a Pokemon', pokemon: pokemon.data.results});
	} catch(err) {
		console.log(err);
		res.redirect('/pokemon')
	}
	
}

function show(req, res, next) {
	res.render('pokemon/show', {title: 'Individual Pokemon'});
}


module.exports = {
	index,
	new: newPokemon,
	show,
}