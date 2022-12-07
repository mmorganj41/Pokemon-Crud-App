const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pokemonSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		}, 		
		nickname: String,
		types: [{
			type: String,
			enum: ["normal", "fighting","flying","poison","ground","rock","bug","ghost", "steel", "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark"],
		}],
		experience: {
			type: Number,
			min: 0,
			default: 0,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		hp: {
			type: Number,
			min: 0,
			required: true,
		},
		attack: {
			type: Number,
			min: 0,
			required: true,
		},
		defense: {
			type: Number,
			min: 0,
			required: true,
		},
		speed: {
			type: Number,
			min: 0,
			required: true,
		},
		specialAttack: {
			type: Number,
			min: 0,
			required: true,
		},
		specialDefense: {
			type: Number,
			min: 0,
			required: true,
		},
		nature: {
			type: String,
			required: true,
			enum: ["hardy", "bold", "modest", "calm", "timid", "lonely", "docile", "mild", "gentle", "hasty", "adamant", "impish", "bashful", "careful", "rash", "jolly", "naughty", "lax", "quirky", "naive"]
		},
		user: {type: Schema.Types.ObjectId, ref: 'User'},
		trainer: String,
	}, 
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Pokemon', pokemonSchema);