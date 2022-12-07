const { default: axios } = require('axios');
const Move = require('../models/move');

async function create(req, res, next) {
	try {

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
			pokemon: req.params.id,
		};

		await Move.create(move);

		res.redirect(`/pokemon/${req.params.id}`);
	} catch(err) {
		console.log(err);
		res.redirect(`/pokemon/${req.params.id}`);
	}
}

function deleteMove(req, res, next) {
	res.send('Router works');
}


module.exports = {
	create,
	delete: deleteMove,
}