
async function index(req, res, next) {
	try {
		res.render('pokemon/index');
	} catch(err) {
		console.log(err)
		res.send('Error loading index check terminal')
	}
}


module.exports = {
	index,
}