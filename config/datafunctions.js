function pokemonLevel(experience) {
	return Math.min(Math.floor(experience ** (1 / 3)), 100);
}

module.exports = {
	pokemonLevel,
}