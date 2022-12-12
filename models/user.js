const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  googleId: {
	type: String,
	required: true,
  },
  email: String,
  avatar: String,
  money: Number,
  currentPokemon: {type: Schema.Types.ObjectId, ref :'Pokemon'},
  pokemonImage: String,
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);