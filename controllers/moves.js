const Move = require('../models/move');

function create(req, res, next) {
	res.send('Router works');
}

function deleteMove(req, res, next) {
	res.send('Router works');
}


module.exports = {
	create,
	delete: deleteMove,
}