const { default: axios } = require('axios');
const Move = require('../models/move');
const dataFunctions = require('../config/datafunctions');

async function create(req, res, next) {
	try {

		const moveData = await axios({
			method: 'get',
			url: req.body.url,
			headers: {'accept-encoding': 'json'},
		})

		const move = {
			name: (moveData.data.name).replace('-', ' '),
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
			meta: moveData.data.meta,
			effectChance: moveData.data.effect_chance,
			priority: moveData.data.priority,
		};

		await Move.create(move);

		res.redirect(`/pokemon/${req.params.id}`);
	} catch(err) {
		console.log(err);
		res.redirect(`/pokemon/${req.params.id}`);
	}
}

async function deleteMove(req, res, next) {
	try {
		const deletedMove = await Move.findByIdAndDelete(req.params.id);
		res.redirect(`/pokemon/${deletedMove.pokemon}`);
	} catch(err) {
		console.log(err);
		res.redirect('/pokemon');
	}
}

async function show(req, res, next) {
	try {
		const move = await Move.findById(req.params.id);
		move.info = move.info.replace(/\$effect_chance/, move.effectChance);
		move.level = dataFunctions.moveLevel(move.experience);
		res.render('moves/show', {title: 'Move', move});
	} catch(err) {
		console.log(err);
		res.send('Error showing move');
	}
}

module.exports = {
	create,
	delete: deleteMove,
	show,
}