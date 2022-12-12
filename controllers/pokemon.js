const Pokemon = require('../models/pokemon');
const Move = require('../models/move');
const dataFunctions = require('../config/datafunctions');
const axios = require('axios');
const pokeAPIURL = "https://pokeapi.co/api/v2/";

const stats = ['hp', 'attack', 'defense', 'speed', 'specialAttack', 'specialDefense'];

const natureBoost = {
	attack: ['lonely', 'brave', 'adamant', 'naughty'],
	defense: ['bold', 'relaxed', 'impish', 'lax'],
	speed: ['timid', 'hasty', 'jolly', 'naive'],
	specialAttack: ['modest', 'mild', 'quiet', 'rash'],
	specialDefense: ['calm', 'gentle', 'sassy', 'careful'],
	hp: [],
}

const natureDrop = {
	attack: ['bold', 'timid', 'modest', 'calm'],
	defense: ['lonely', 'hasty', 'mild', 'gentle'],
	speed: ['brave', 'relaxed', 'quiet', 'sassy'],
	specialAttack: ['adamant', 'impish', 'jolly', 'careful'],
	specialDefense: ['naughty', 'lax', 'naive', 'rash'],
	hp: [],
}

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

		console.log(pokemon);


		
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

		const pokemonSpeciesQuery = await axios({
			method: 'get',
			url: req.body.url.replace(/pokemon/, 'pokemon-species'),
	  		headers: {'accept-encoding': 'json'},
		});

		const evolutionChain = await axios({
			method: 'get',
			url: pokemonSpeciesQuery.data.evolution_chain.url,
	  		headers: {'accept-encoding': 'json'},
		})

		const pokemon = {
			name: pokemonQuery.data.name,	
			nickname: req.body.nickname,
			types: pokemonQuery.data.types.map(type => type.type.name),
			experience: 0,
			shiny: shinyGen(),
			nature: natureGen(),
			user: req.user._id,
			trainer: req.user.name,
			evolution: [],
		};

		pokemon.images = imageGen(pokemon.shiny, pokemonQuery.data);

		stats.forEach(stat => {
			let statArray = {
				base: pokemonQuery.data.stats.find(e => e.stat.name === stat.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)).base_stat,
				variation: statGen(stat, pokemon.nature),
			};
			pokemon[stat] = statArray;
		});

		let evolutionData = evolutionFinder(evolutionChain.data.chain, pokemonQuery.data.name);

		evolutionData.forEach(evolution => {
			pokemon.evolution.push({
				species: evolution.species,
				data: evolution.evolution_details[0],
			})
		})

		const createdPokemon = await Pokemon.create(pokemon);

		res.redirect(`/pokemon/${createdPokemon._id}`)

	} catch(err) {
		console.log(err);
		res.send('ERROR check terminal');
	}

	function statGen(name, nature){
		const direction = (Math.round(Math.random())) ? 1 : -1;
		const boost = 1 + (natureBoost[name].includes(nature) ? .1 : 0) - (natureDrop[name].includes(nature) ? .1 : 0);
		return [Math.round(Math.random()*31*boost*100)/100, Math.round((direction * Math.random()*2000)*boost)/100];	
	}
	
	function natureGen(){
		const natures = ["hardy", "bold", "modest", "calm", "timid", "lonely", "docile", "mild", "gentle", "hasty", "adamant", "impish", "bashful", "careful", "rash", "jolly", "naughty", "lax", "quirky", "naive"];
		return natures[Math.floor(Math.random()*natures.length)];
	}
	
	function shinyGen() {
		return Math.floor(Math.random()*1000) === 0;
	}

}

function evolutionFinder(chain, name) {
	if (chain.species.name === name) {
		return (chain.evolves_to);
	} else if (chain.evolves_to.length === 0) {
		return null;
	} else {
		for (const path of chain.evolves_to) {
			let result = evolutionFinder(path, name);
			console.log(result, '<-- result')
			if (result !== null) {
				return result;
			}
		};
	} 
	return null;
}

function imageGen(bool, query){
	if (bool) {
		return [query.sprites.front_shiny, query.sprites.back_shiny];
	} else {
		return [query.sprites.front_default, query.sprites.back_default];
	}
}

async function deletePokemon(req, res, next) {
	try {
		const pokemon = await Pokemon.findById(req.params.id); 

		if (req.user?._id != String(pokemon.user)) return res.redirect(`/pokemon`);

		await Move.remove({pokemon:req.params.id});

		pokemon.remove();

		res.redirect(`/pokemon`);

	} catch(err) {
		console.log(err);
		res.send('error deleting pokemon');
	}
}

async function update(req,res,next){
	try {
		const pokemon = await Pokemon.findById(req.params.id);
		
		req.body.moves.forEach(async moveObj => {
			const move = await Move.findById(moveObj.id);

			move.experience = moveObj.experience;

			await move.save();
		})

		pokemon.experience = req.body.experience;

		await pokemon.save();

		res.send('updated!');
	} catch(err) {
		console.log(err);
		res.send('Error showing show json');
	}
}

async function evolve(req, res, next) {
	try {
		const pokemon = await Pokemon.findById(req.params.id);

		if (req.user?._id != String(pokemon.user)) return res.redirect(`/pokemon`);

		const level = dataFunctions.pokemonLevel(pokemon.experience);
		const evolutionName = pokemon.evolution.find(e => e.data.min_level < level).species.name;

		if (evolutionName) {
			const evolution = await axios(
				{
					method: 'get',
					url: `${pokeAPIURL}/pokemon/${evolutionName}`,
					headers: {'accept-encoding': 'json'},
			});
	
			const pokemonSpeciesQuery = await axios({
				method: 'get',
				url: `${pokeAPIURL}/pokemon-species/${evolutionName}`,
				  headers: {'accept-encoding': 'json'},
			});
	
			const evolutionChain = await axios({
				method: 'get',
				url: pokemonSpeciesQuery.data.evolution_chain.url,
				  headers: {'accept-encoding': 'json'},
			})
	
			pokemon.name = evolution.data.name;
			stats.forEach(stat => {
				pokemon[stat].base = evolution.data.stats.find(e => e.stat.name === stat.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)).base_stat;
			});
			pokemon.images = imageGen(pokemon.shiny, evolution.data);
			pokemon.types = evolution.data.types.map(type => type.type.name);
			pokemon.evolution = [];

			let evolutionData = evolutionFinder(evolutionChain.data.chain, evolutionName);
			evolutionData.forEach(evolution => {
				pokemon.evolution.push({
					species: evolution.species,
					data: evolution.evolution_details[0],
				})
			})

			await pokemon.save();

			res.redirect(`/pokemon/${req.params.id}`);
		} else {
			res.redirect(`/pokemon/${req.params.id}`);
		}

	} catch(err) {
		console.log(err);
		res.send('Error evolving pokemon');
	}
	

}

module.exports = {
	index,
	new: newPokemon,
	show,
	create,
	delete: deletePokemon,
	update,
	evolve,
}