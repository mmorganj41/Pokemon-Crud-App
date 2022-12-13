const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const Schema = mongoose.Schema;

const moveSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		accuracy: Number,
		type: {
			type: String,
			required: true,
			enum: ["normal", "fighting","flying","poison","ground","rock","bug","ghost", "steel", "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"],
		},
		damageClass: {
			type: String,
			enum: ['special', 'physical', 'status'],
		},
		experience: {
			type: Number,
			default: 0,
			min: 0,
		},
		power: Number,
		pp: {
			type: Number,
			min: 0,
			required: true,
		},
		target: {
			type: String,
			required: true,
		},
		effectChance: Number,
		statchange: Object,
		meta: Object,
		info: String,
		pokemon: {type: Schema.Types.ObjectId, ref: 'Pokemon'},
		priority: Number
	}
)

module.exports = mongoose.model('Move', moveSchema);