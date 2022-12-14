const natureBoost = {
	attack: ['lonely', 'brave', 'adamant', 'naughty'],
	defense: ['bold', 'relaxed', 'impish', 'lax'],
	speed: ['timid', 'hasty', 'jolly', 'naive'],
	specialAttack: ['modest', 'mild', 'quiet', 'rash'],
	specialDefense: ['calm', 'gentle', 'sassy', 'careful'],
	hp: [],
}

const natureDrop = {
	attack: ['bold', 'timid', 'modest', 'calm'],
	defense: ['lonely', 'hasty', 'mild', 'gentle'],
	speed: ['brave', 'relaxed', 'quiet', 'sassy'],
	specialAttack: ['adamant', 'impish', 'jolly', 'careful'],
	specialDefense: ['naughty', 'lax', 'naive', 'rash'],
	hp: [],
}

function pokemonLevel(experience) {
	return Math.min(Math.floor(experience ** (1 / 3)), 100);
}

function moveLevel(experience) {
	return Math.min(Math.floor(experience ** (1 / 3)), 10);
}

function statGen(name, nature){
	const direction = (Math.round(Math.random())) ? 1 : -1;
	const boost = 1 + (natureBoost[name].includes(nature) ? .1 : 0) - (natureDrop[name].includes(nature) ? .1 : 0);
	return [Math.round(Math.random()*31*boost*100)/100, Math.round((direction * Math.random()*2000)*boost)/100];	
}

function natureGen(){
	const natures = ["hardy", "bold", "modest", "calm", "timid", "lonely", "docile", "mild", "gentle", "hasty", "adamant", "impish", "bashful", "careful", "rash", "jolly", "naughty", "lax", "quirky", "naive"];
	return natures[Math.floor(Math.random()*natures.length)];
}

function shinyGen() {
	return Math.floor(Math.random()*1000) === 0;
}

function evolutionFinder(chain, name) {
	if (chain.species.name === name) {
		return (chain.evolves_to);
	} else if (chain.evolves_to.length === 0) {
		return null;
	} else {
		for (const path of chain.evolves_to) {
			let result = evolutionFinder(path, name);
			console.log(result, '<-- result')
			if (result !== null) {
				return result;
			}
		};
	} 
	return null;
}

function imageGen(bool, query){
	if (bool) {
		return [query.sprites.front_shiny, query.sprites.back_shiny];
	} else {
		return [query.sprites.front_default, query.sprites.back_default];
	}
}

function moveOptionParser(pokemonWithLevel, allMoves, learningArray, includeBool=true) {
	const moveNames = pokemonWithLevel.moves.map(move => move.name);
	
	return allMoves.reduce((filtered, moveData) => {
		const index = moveData.version_group_details.findIndex(details => {
			return details.version_group.name === "emerald";
		})

		if (index >= 0) {
			const learnMethod = moveData.version_group_details[index].move_learn_method.name;
			const levelLearned = moveData.version_group_details[index].level_learned_at;
			const moveName = moveData.move.name;

			if (!(moveNames.includes(moveName)) && levelLearned <= pokemonWithLevel.level && (includeBool ? learningArray.includes(learnMethod) : !learningArray.includes(learnMethod))) {
				filtered.push(moveData.move);
			}
		}
		return filtered;
	}, [])
}

const stats = ['hp', 'attack', 'defense', 'speed', 'specialAttack', 'specialDefense'];

module.exports = {
	pokemonLevel,
	moveLevel,
	statGen,
	imageGen,
	evolutionFinder,
	shinyGen,
	natureGen,
	stats,
	moveOptionParser,
}