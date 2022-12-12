const Pokemon = require('../models/pokemon');
const Move = require('../models/move');
const axios = require('axios');
const dataFunctions = require('../config/datafunctions');
const pokeAPIURL = "https://pokeapi.co/api/v2/";

const stats = ['hp', 'attack', 'defense', 'speed', 'specialAttack', 'specialDefense'];

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

		console.log(moveNames);

		const moveOptions = pokemonQuery.data.moves.reduce((filtered, moveData) => {
			const learnMethod = moveData.version_group_details[0].move_learn_method.name;
			const levelLearned = moveData.version_group_details[0].level_learned_at;
			const moveName = moveData.move.name;
	
			if (!(moveNames.includes(moveName)) && levelLearned <= pokemon.level && ['egg', 'machine', 'level-up'].includes(learnMethod)) {
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

		if (req.user?._id != String(pokemon.user)) return res.redirect(`/pokemon/${req.params.pokeid}`);

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

async function random(req, res, next){
	try {
		const pokemon = await Pokemon.findById(req.params.pokeid);

		if (req.user?._id != String(pokemon.user)) return res.redirect(`/pokemon/${req.params.pokeid}`);

		const pokeMoves = await Move.find({pokemon: req.params.pokeid});

		pokemon.moves = pokeMoves;
		pokemon.level = dataFunctions.pokemonLevel(pokemon.experience);

		const randomPokemonNumber = Math.floor(Math.random()*386)+1;

		const pokemonQuery = await axios({
			method: 'get',
			url: `${pokeAPIURL}pokemon/${randomPokemonNumber}`,
	  		headers: {'accept-encoding': 'json'},
		});

		const opponent = {
			name: pokemonQuery.data.name,	
			nickname: '',
			types: pokemonQuery.data.types.map(type => type.type.name),
			experience: generateExperience(pokemon.experience),
			shiny: dataFunctions.shinyGen(),
			nature: dataFunctions.natureGen(),
			user: null,
			trainer: null,
			evolution: [],
		};

		opponent.images = dataFunctions.imageGen(opponent.shiny, pokemonQuery.data);

		stats.forEach(stat => {
			let statArray = {
				base: pokemonQuery.data.stats.find(e => e.stat.name === stat.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)).base_stat,
				variation: dataFunctions.statGen(stat, opponent.nature),
			};
			opponent[stat] = statArray;
		});

		opponent.level = dataFunctions.pokemonLevel(opponent.experience);

		opponent.moves = [];

		const opDocument = await Pokemon.create(opponent);

		opponent._id = opDocument._id;

		const moveOptions = pokemonQuery.data.moves.reduce((filtered, moveData) => {
			const index = moveData.version_group_details.findIndex(details => {
				return details.version_group.name === "emerald";
			})

			if (index >= 0) {
				const learnMethod = moveData.version_group_details[index].move_learn_method.name;
				const levelLearned = moveData.version_group_details[index].level_learned_at;
		
				if (levelLearned <= opponent.level && ['egg', 'level-up'].includes(learnMethod)) {
					filtered.push(moveData.move);
				}
			}
			return filtered;
		}, [])

		const moveCount = Math.ceil(Math.random()*4)+2;

		for (let i = 0; i < moveCount; i++) {
			if (moveOptions.length === 0) break;
			const randomIndex = Math.floor(Math.random()*moveOptions.length);
			opponent.moves.push(moveOptions.splice(randomIndex, 1)[0]);
		}

		opponent.moves.forEach(async m => {
			const moveData = await axios({
				method: 'get',
				url: `${m.url}`,
				headers: {'accept-encoding': 'json'},
			})

			const move = {
				name: moveData.data.name,
				accuracy: moveData.data.accuracy,
				type: moveData.data.type.name,
				damageClass: moveData.data.damage_class.name,
				experience: 0,
				power: moveData.data.power,
				pp: moveData.data.pp,
				target: moveData.data.target.name,
				statchange: moveData.data.stat_changes,
				info: moveData.data.effect_entries[0].effect,
				pokemon: opponent._id,
				meta: moveData.data.meta,
				effectChance: moveData.data.effect_chance,
				priority: moveData.data.priority,
			};

			await Move.create(move);
		});

		await res.render('battle/show', {title: 'Battle', pokemon, opponent})

		function generateExperience(experience) {
			let variation = Math.random()*.4;
			let base = .7;
			return Math.floor((variation+base)*experience);
		}
	} catch(err) {
		console.log(err)
		res.send('error loading battle');
	}
}

module.exports = {
	index,
	show,
	random,
}