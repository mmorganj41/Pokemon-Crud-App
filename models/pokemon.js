const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statSchema = new Schema(
	{
		base: {
			type: Number,
			min: 0,
			required: true,
		},
		variation: [{
			type: Number,
			required: true,
		}],
	}
)

const pokemonSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		}, 		
		nickname: String,
		types: [{
			type: String,
			enum: ["normal", "fighting","flying","poison","ground","rock","bug","ghost", "steel", "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"],
		}],
		experience: {
			type: Number,
			min: 0,
			default: 0,
			required: true,
		},
		shiny: {
			type: Boolean,
			required: true,
		},
		images: [{
			type: String,
		}],
		hp: {
			type: statSchema,
			required: true,
		},
		attack: {
			type: statSchema,
			required: true,
		},
		defense: {
			type: statSchema,
			min: 0,
			required: true,
		},
		speed: {
			type: statSchema,
			required: true,
		},
		specialAttack: {
			type: statSchema,
			required: true,
		},
		specialDefense: {
			type: statSchema,
			required: true,
		},
		nature: {
			type: String,
			required: true,
			enum: ["hardy", "bold", "modest", "calm", "timid", "lonely", "docile", "mild", "gentle", "hasty", "adamant", "impish", "bashful", "careful", "rash", "jolly", "naughty", "lax", "quirky", "naive"]
		},
		evolution: [{type: Object}],
		user: {type: Schema.Types.ObjectId, ref: 'User'},
		trainer: String,
	}, 
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Pokemon', pokemonSchema);