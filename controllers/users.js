const User = require('../models/user');

async function updateMoney(req, res, next) {
		try {
		const user = await User.findById(req.params.id);

		if (req.user?._id != String(user._id)) return res.send(`NO!`);

		user.money += req.body.money;

		await user.save();

		res.send('Updated Money');
	} catch(err) {
		console.log(err);
		res.send('error updating money');
	}
}

module.exports = {
	updateMoney,
}