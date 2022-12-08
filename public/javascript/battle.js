// Constants

const playerId = window.location.pathname.match(/(?<=pokemon\/)\w*(?=\/battle)/i)[0];
const opponentId = window.location.pathname.match(/(?<=battle\/)\w*/)[0];

const playerPokemon = {};
const opponentPokemon = {};

const moveDamage = {
	normal: {
		rock: .5,
		ghost: 0,
		steel: .5,
	},
	fire: {
		fire: .5,
		water: .5,
		grass: 2,
		ice: 2,
		bug: 2,
		rock: .5,
		dragon: .5,
		steel: 2,
	},
	water: {
		fire: 2,
		water: .5,
		grass: .5,
		ground: 2,
		rock: 2,
		dragon: .5,
	},
	electric: {
		water: 2,
		electric: .5,
		grass: .5,
		ground: 0,
		flying: 2,
		dragon: .5,
	},
	grass: {
		fire: .5,
		water: 2,
		grass: .5,
		poison: .5,
		ground: 2,
		flying: .5,
		bug: .5,
		rock: 2,
		dragon: .5,
		steel: .5,
	},
	ice: {
		fire: .5,
		water: .5,
		grass: 2,
		ice: .5,
		ground: 2,
		flying: 2,
		dragon: 2,
		steel: .5,
	},
	fighting: {
		normal: 2,
		ice: 2,
		poison: .5,
		flying: .5,
		psychic: .5,
		bug: .5,
		rock: 2,
		ghost: 0,
		dark: 2,
		steel: 2,
	},
	poison: {
		grass: 2,
		poison: .5,
		ground: .5,
		rock: .5,
		ghost: .5,
		steel: 0,
		fairy: 2,
	},
	ground: {
		fire: 2,
		electric: 2,
		grass: .5,
		poison: 2,
		flying: 0,
		bug: .5,
		rock: 2,
		steel: 2,
	},
	flying: {
		electric: .5,
		grass: 2,
		fighting: 2,
		bug: 2,
		rock: .5,
		steel: .5,
	},
	psychic: {
		fighting: 2,
		poison: 2,
		psychic: .5,
		dark: 0,
		steel: .5,
	}
}

const struggle = {
	name: "struggle",
	accuracy: null,
	type: "normal",
	damageClass: "physical",
	power: 50,
	pp: Infinity,
	target: "random-opponent",
	statchange: [],
	meta: {
		ailment: {
			name: "none",
			url: "https://pokeapi.co/api/v2/move-ailment/0/"
		},
		ailment_chance: 0,
		category: {
			name: "damage",
			url: "https://pokeapi.co/api/v2/move-category/0/",
		},
		crit_rate: 0,
		drain: 0,
		flinch_chance: 0,
		healing: -25,
		max_hits: null,
		max_turns: null,
		min_hits: null,
		min_turns: null,
		stat_chance: 0,
	}
}

const stats = ['attack', 'defense', 'speed', 'specialAttack', 'specialDefense'];

// Global Variables

let gameOver
let winner

// Dom elements

// Callback Functions

// Helper Functions

function stageMultipliers(stat) {
	if (stat === 0) {
		return 1;
	} else if (stat < 0) {
		return 2/(2+Math.abs(Math.max(stat, -6)));
	} else {
		return (2+Math.min(6,stat))/2;
	}
}

function accEvadeMultiplier(stat) {
	if (stat === 0) {
		return 1;
	} else if (stat < 0) {
		return 3/(3+Math.abs(Math.max(stat, -6)));
	} else {
		return (3+Math.min(6,stat))/3;
	}
}


function turn() {

}

function move(attacker, move, defender) {

}

async function getPokemonInfo(object, id) {
	try {
		const pokemon = await axios({
			method: 'get',
			url: `http://localhost:3000/api/pokemon/${id}`,
		})

		const moves = await axios({
			method: 'get',
			url: `http://localhost:3000/api/pokemon/${id}/moves`,
		})

		object.name = pokemon.data.name;
		object.types = pokemon.data.types;
		object.experience = pokemon.data.experience;
		object.level = pokemonLevel(pokemon.data.experience);
		
		stats.forEach(stat => {
			object[stat] = [calculateStat(pokemon.data[stat], object.level), 0];
		})

		let hp = calculateHealth(pokemon.data.hp, object.level);

		object.hp = [hp, hp];
		object.accuracy = 0;
		object.evasion = 0;
		object.status = [null, null];

		object.moves = moves.data;
		object.moves.forEach((move, index) => {
			let level = moveLevel(move.experience);
			object.moves[index].level = level;
			object.moves[index].power = Math.floor(object.moves[index].power*(1+level*.03));
			object.moves[index].pp = Math.floor(object.moves[index].pp*(1+level*.05));
		})

	} catch(err) {
		console.log(err);
	}

	function pokemonLevel(experience) {
		return Math.min(Math.floor(experience ** (1 / 3)), 100);
	}
	
	function moveLevel(experience) {
		return Math.min(Math.floor(experience ** (1 / 3)), 10);
	}

	function calculateHealth(health, level) {
		return Math.round((health*(level+1))/100 + level + 10);
	}

	function calculateStat(amount, level) {
		return Math.round((amount*(level+1))/100 + 5);
	}
}

// Main Functions

init();

function init() {
	getPokemonInfo(playerPokemon, playerId);
	getPokemonInfo(opponentPokemon, opponentId);
	render();
}

function render() {
	console.log(playerPokemon);
}