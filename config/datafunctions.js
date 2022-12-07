function pokemonLevel(experience) {
	return Math.floor(experience ** (1 / 3));
}

module.exports = {
	pokemonLevel,
}