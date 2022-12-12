const User = require('../models/user');
const Pokemon = require('../models/pokemon');

async function updateMoney(req, res, next) {
	try {
		const user = await User.findById(req.user._id);

		user.money += req.body.money;

		await user.save();

		res.send('Updated Money');
	} catch(err) {
		console.log(err);
		res.send('error updating money');
	}
}

async function selectPokemon(req, res, next) {
	try {
		const user = await User.findById(req.user._id);

		const pokemon = await Pokemon.findById(req.params.id);

		if (req.user?._id != String(pokemon.user)) return res.send(`NO!`);

		user.currentPokemon = pokemon._id;
		user.pokemonImage = pokemon.images[0];

		await user.save();
		
		res.redirect(`/pokemon/${user.currentPokemon}`);
	} catch(err) {
		console.log(err);
		res.send('error updating pokemon');
	}
}

module.exports = {
	updateMoney,
	selectPokemon,
}