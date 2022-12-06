const Pokemon = require('../models/pokemon');

async function index(req, res, next) {
	try {
		const pokemon = await Pokemon.find({})
			.populate("trainer")
			.exec();
		console.log(pokemon);

		res.render('pokemon/index', {pokemon});
	} catch(err) {
		console.log(err)
		res.send('Error loading index check terminal')
	}
}


module.exports = {
	index,
}