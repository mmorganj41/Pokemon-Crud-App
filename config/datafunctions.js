function pokemonLevel(experience) {
	return Math.min(Math.floor(experience ** (1 / 3)), 100);
}

function moveLevel(experience) {
	return Math.min(Math.floor(experience ** (1 / 3)), 10);
}

module.exports = {
	pokemonLevel,
	moveLevel,
}