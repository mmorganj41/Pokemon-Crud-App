const Pokemon = require('../models/pokemon');
const Move = require('../models/move');
const dataFunctions = require('../config/datafunctions');
const axios = require('axios');
const User = require('../models/user');
const pokeAPIURL = "https://pokeapi.co/api/v2/";
const availablePokemon = [];

findAvailablePokemon();

async function findAvailablePokemon() {
	try {
		const pokemon = await axios({
			method: 'get',
			url: `${pokeAPIURL}pokemon-species/?limit=386`,
			headers: {'accept-encoding': 'json'},
		});
	
		pokemon.data.results.forEach(async p => {
			const pQuery = await axios({
				method: 'get',
				url: `${pokeAPIURL}pokemon-species/${p.name}`,
				headers: {'accept-encoding': 'json'},
			})
	
			if (!pQuery.data.evolves_from_species?.name && pQuery.data.egg_groups[0]?.name !== 'no-eggs') {
				let number = p.url.match(/(?<=species\/)\d*/)[0];
				availablePokemon[number] = p;
			}
		})
	} catch(err) {
		console.log(err);
	}
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

async function user(req, res, next) {
	try {
		const pokemon = await Pokemon.find({user: req.user?._id})

		pokemon.forEach((poke,i) => {
			pokemon[i].level = dataFunctions.pokemonLevel(poke.experience);
		})

		res.render('pokemon/index', {title: 'User Pokemon', pokemon});
	} catch(err) {
		console.log(err)
		res.send('Error loading index check terminal')
	}
}

function newPokemon(req, res, next) {
	res.render('pokemon/new', {title: 'Catch a Pokemon', pokemon: availablePokemon});
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

		let currentPokemon;
		if (req.user?.currentPokemon) {
			currentPokemon = await Pokemon.findById(req.user.currentPokemon);
		}

		const moves = await Move.find({pokemon: pokemon._id});
		
		pokemon.moves = moves;

		const learningArray = ['egg', 'level-up'];

		const moveOptions = dataFunctions.moveOptionParser(pokemon, pokemonQuery.data.moves, learningArray);

		pokemon.moveOptions = moveOptions;
		
		res.render('pokemon/show', {title: 'Pokemon', pokemon, currentPokemon});
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
			experience: 1,
			shiny: dataFunctions.shinyGen(),
			nature: dataFunctions.natureGen(),
			user: req.user._id,
			trainer: req.user.name,
			evolution: [],
		};

		pokemon.images = dataFunctions.imageGen(pokemon.shiny, pokemonQuery.data);
		pokemon.currentHp = 100;
		
		let currentDate = new Date();
		let energyDate = currentDate - 1000 * 60 * 60 * 6;
		let hungerDate = currentDate - 1000 * 60 * 60 * 10;
		pokemon.energy = new Date(energyDate);
		pokemon.hunger = new Date(hungerDate);

		dataFunctions.stats.forEach(stat => {
			let statArray = {
				base: pokemonQuery.data.stats.find(e => e.stat.name === stat.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)).base_stat,
				variation: dataFunctions.statGen(stat, pokemon.nature),
			};
			pokemon[stat] = statArray;
		});

		let evolutionData = dataFunctions.evolutionFinder(evolutionChain.data.chain, pokemonQuery.data.name);

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

}

async function deletePokemon(req, res, next) {
	try {
		const pokemon = await Pokemon.findById(req.params.id); 
		
		if (req.user?._id == String(pokemon.user) || !pokemon.user || req.user?.admin === true) {
			await Move.deleteMany({pokemon:req.params.id});

			if (req.user.currentPokemon?.toString() == pokemon._id) {
				const user = await User.findById(req.user._id);
				user.currentPokemon = null;
				user.pokemonImage = null;
				await user.save();
			}
					
			pokemon.deleteOne();
	
		} 

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
		pokemon.currentHp = req.body.currentHp;
		
		let currentDate = new Date();
		let highestEnergy = Number(currentDate) - 1000 * 60 * 60 * 6;
		let currentEnergy = Number(pokemon.energy);

		currentEnergy = ((currentEnergy < highestEnergy)) ? highestEnergy : currentEnergy;

		let energyVal = req.body.energy + currentEnergy;
		let newEnergy = new Date(energyVal);
		
		let zeroEnergySwitch = newEnergy > currentDate;

		pokemon.energy = (zeroEnergySwitch) ? currentDate : newEnergy;

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

		if (req.user?._id != String(pokemon.user) && !req.user?.admin) return res.redirect(`/pokemon`);

		const level = dataFunctions.pokemonLevel(pokemon.experience);
		const evolutionName = pokemon.evolution.find(e => e.data.min_level <= level).species.name;

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
			dataFunctions.stats.forEach(stat => {
				pokemon[stat].base = evolution.data.stats.find(e => e.stat.name === stat.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)).base_stat;
			});
			pokemon.images = dataFunctions.imageGen(pokemon.shiny, evolution.data);
			pokemon.types = evolution.data.types.map(type => type.type.name);
			pokemon.evolution = [];

			let evolutionData = dataFunctions.evolutionFinder(evolutionChain.data.chain, evolutionName);
			evolutionData.forEach(evolution => {
				pokemon.evolution.push({
					species: evolution.species,
					data: evolution.evolution_details[0],
				})
			})

			await pokemon.save();

			if (pokemon._id.equals(req.user.currentPokemon)) {
				const user = await User.findById(req.user._id);
				user.pokemonImage = pokemon.images[0];
				user.save();
			}

			res.redirect(`/pokemon/${req.params.id}`);
		} else {
			res.redirect(`/pokemon/${req.params.id}`);
		}

	} catch(err) {
		console.log(err);
		res.send('Error evolving pokemon');
	}
}

function parseEnergy(energy) {
	// for debugging
	const date = new Date(), day = 1000 * 60 * 60 * 24
	return 100, (date - energy)/day*4*100

}

module.exports = {
	index,
	user,
	new: newPokemon,
	show,
	create,
	delete: deletePokemon,
	update,
	evolve,
}