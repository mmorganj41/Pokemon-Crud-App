const mongoose = require('mongoose');
const Schema = mongoose.Schema

const userSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	notified: {
		type: Boolean,
		default: false,
	},
	money: {
		type: Number,
		default: 0,
	},
	pokemon: [{type: Schema.Types.ObjectId, ref: 'Pokemon'}],
})

const tradeSchema = new Schema({
	initiator: {
		type: userSchema,
		required: true,
	},
	receiver: {
		type: userSchema,
		required: true,
	},
})

module.exports = mongoose.model('Trade', tradeSchema)