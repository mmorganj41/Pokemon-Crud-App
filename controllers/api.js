const Pokemon = require('../models/pokemon');
const Move = require('../models/move');

async function index(req,res,next) {
	try {
		const pokemon = await Pokemon.find({});

		res.json(pokemon);
	} catch(err) {
		console.log(err);
		res.send('Error showing index json');
	}
}

async function moveIndex(req,res,next) {
	try {
		const moves = await Move.find({});

		res.json(moves);
	} catch(err) {
		console.log(err);
		res.send('Error showing index json');
	}
}

async function show(req,res,next) {
	try {
		const pokemon = await Pokemon.findById(req.params.id);

		res.json(pokemon);
	} catch(err) {
		console.log(err);
		res.send('Error showing show json');
	}
}

async function showPokemonMoves(req,res,next) {
	try {
		const move = await Move.find({pokemon: req.params.id});

		res.json(move);
	} catch(err) {
		console.log(err);
		res.send('Error showing show json');
	}
}

async function deletePokemon(req, res, next) {
	try {
		const pokemon = await Pokemon.findById(req.params.id); 

		if (pokemon.user !== null) return res.redirect(`/pokemon`);

		await Move.remove({pokemon:req.params.id});

		pokemon.remove();

		res.send('random deleted pokemon');

	} catch(err) {
		console.log(err);
		res.send('error deleting pokemon');
	}
}


module.exports = {
	index,
	show,
	moveIndex,
	showPokemonMoves,
	delete: deletePokemon,
}