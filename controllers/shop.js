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

		const learningArray = ['egg', 'level-up'];
		const moveOptions = dataFunctions.moveOptionParser(pokemon, pokemonQuery.data.moves, learningArray, false);

		pokemon.moveOptions = moveOptions;

	 	res.render('shop/index', {title: 'Shop', pokemon})
	} catch(err) {
		console.log(err);
		res.send('Error displaying shop');
	}
}

async function move(req, res, next) {
	try {
		const cost = 1000;

		if (req.user?.money < cost || !req.user?.currentPokemon) return res.redirect('/shop');

		const moveData = await axios({
			method: 'get',
			url: req.body.url,
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
			pokemon: req.user.currentPokemon,
			meta: moveData.data.meta,
			effectChance: moveData.data.effect_chance,
			priority: moveData.data.priority,
		};

		await Move.create(move);

		await spendMoney(req, cost);

		res.redirect(`/shop`);
	} catch(err) {
		console.log(err);
		res.redirect(`/shop`);
	}
}

async function feed(req, res, next) {
	try {
		const cost = 20;

		if (req.user?.money < cost || !req.user?.currentPokemon) return res.redirect('/shop');
		
		const pokemon = await Pokemon.findById(req.user.currentPokemon);

		let currentDate = new Date();
		let minHunger = currentDate - 1000 * 60 * 60 * 24 * 3
		let hungerVal = Math.max(pokemon.hunger || 0, minHunger) + 1000 * 60 * 60 * 24;
		let newHunger = new Date(hungerVal);
		
		pokemon.hunger = (newHunger > currentDate) ? currentDate : newHunger;

		await pokemon.save();

		await spendMoney(req, cost);

		res.redirect(`/shop`);
	} catch(err) {
		console.log(err);
		res.redirect(`/shop`);
	}
}

async function heal(req, res, next) {
	try {
		const cost = 10;

		if (req.user?.money < cost || !req.user?.currentPokemon) return res.redirect('/shop');
		
		const pokemon = await Pokemon.findById(req.user.currentPokemon);

		pokemon.currentHp = 100;

		await pokemon.save();

		await spendMoney(req, cost);

		res.redirect(`/shop`);
	} catch(err) {
		console.log(err);
		res.redirect(`/shop`);
	}
}

async function spendMoney(req, cost) {
	const user = await User.findById(req.user._id);

	user.money -= cost;

	await user.save();
}

module.exports = {
	index,
	move,
	feed,
	heal,
}