const Trade = require('../models/trade');
const Pokemon = require('../models/pokemon');
const Move = require('../models/move');
const User = require('../models/user');
const dataFunctions = require('../config/datafunctions');

async function index(req, res, next) {
	try {
		res.render('trades/index', {title: 'Trades'});
	} catch(err) {
		console.log(err);
		res.redirect('/');
	}
}

module.exports = {
	index,
}