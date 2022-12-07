const Pokemon = require('../models/pokemon');
const Move = require('../models/move');
const dataFunctions = require('../config/datafunctions');
const axios = require('axios');
const pokeAPIURL = "https://pokeapi.co/api/v2/";

async function index(req, res, next) {
	try {
		const pokemon = await Pokemon.find({})

		pokemon.forEach((poke,i) => {
			pokemon[i].level = dataFunctions.pokemonLevel(poke.experience);
		})

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

		let pokemonLevel = dataFunctions.pokemonLevel(pokemon.experience);

		pokemon.level = pokemonLevel;

		const pokemonQuery = await axios({
			method: 'get',
			url: `${pokeAPIURL}pokemon/${pokemon.name}`,
	  		headers: {'accept-encoding': 'json'},
		});

		const moves = await Move.find({pokemon: pokemon._id});
		const moveNames = moves.map(move => move.name);
		pokemon.moves = moves;

		const moveOptions = pokemonQuery.data.moves.reduce((filtered, moveData) => {
			const learnMethod = moveData.version_group_details[0].move_learn_method.name;
			const levelLearned = moveData.version_group_details[0].level_learned_at;
			const moveName = moveData.move.name;
	
			if (!(moveNames.includes(moveName)) && levelLearned <= pokemonLevel && (learnMethod === 'egg' || learnMethod === 'level-up')) {
				filtered.push(moveData.move);
			}
			return filtered;
		}, [])

		pokemon.moveOptions = moveOptions;


		
		res.render('pokemon/show', {title: 'Pokemon', pokemon});
	} catch(err) {
		console.log(err);
		res.redirect('/pokemon');
	}	
	
}

async function create(req, res, next) {
	try {
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
}

async function deletePokemon(req, res, next) {
	try {
		await Move.remove({pokemon:req.params.id});

		await Pokemon.findByIdAndDelete(req.params.id);

		res.redirect(`/pokemon/}`);

	} catch(err) {
		console.log(err);
		res.send('error deleting pokemon');
	}
}

module.exports = {
	index,
	new: newPokemon,
	show,
	create,
	delete: deletePokemon,
}