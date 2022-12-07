const Pokemon = require('../models/pokemon');
const axios = require('axios');
const pokeAPIURL = "https://pokeapi.co/api/v2/";

async function index(req, res, next) {
	try {
		const pokemon = await Pokemon.find({})

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

async function show(req, res, next) {
	try {
		const pokemon = await Pokemon.findById(req.params.id);
		console.log(pokemon);

		res.render('pokemon/show', {title: 'Pokemon', pokemon});
	} catch(err) {
		console.log(err);
		res.redirecT('/pokemon');
	}	
	
}

async function create(req, res, next) {
	try {
		console.log(req.body.url)

		const pokemonQuery = await axios({
			method: 'get',
			url: req.body.url,
	  		headers: {'accept-encoding': 'json'},
		});

		const pokemon = {
			name: pokemonQuery.data.name,	
			nickname: req.body.nickname,
			types: pokemonQuery.data.types.map(type => type.type.name),
			experience: 0,
			image: imageGen(pokemonQuery.data),
			hp: statGen(pokemonQuery.data, 0),
			attack: statGen(pokemonQuery.data, 1),
			defense: statGen(pokemonQuery.data, 2),
			speed: statGen(pokemonQuery.data, 5),
			specialAttack: statGen(pokemonQuery.data, 3),
			specialDefense: statGen(pokemonQuery.data, 4),
			nature: natureGen(),
			user: req.user._id,
			trainer: req.user.name,
		};

		Pokemon.create(pokemon);

		res.redirect('/pokemon')
	} catch(err) {
		console.log(err);
		res.send('ERROR check terminal');
	}
}

function statGen(query, num){
	const direction = (Math.round(Math.random())) ? 1 : -1;
	const stat = query.stats[num].base_stat 
	return stat + direction * Math.floor(Math.random()*.1*stat)
}

function natureGen(){
	const natures = ["hardy", "bold", "modest", "calm", "timid", "lonely", "docile", "mild", "gentle", "hasty", "adamant", "impish", "bashful", "careful", "rash", "jolly", "naughty", "lax", "quirky", "naive"];
	return natures[Math.floor(Math.random()*natures.length)];
}

function imageGen(query){
	const randomNumber = Math.floor(Math.random()*1000);
	if (randomNumber === 0) {
		return query.sprites.front_shiny;
	} else {
		return query.sprites.front_default;
	}
}

module.exports = {
	index,
	new: newPokemon,
	show,
	create,
}