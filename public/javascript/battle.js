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
	},
	bug: {
		fire: .5,
		grass: 2,
		fighting: .5,
		poison: .5,
		flying: .5,
		psychic: 2,
		ghost: .5,
		dark: 2,
		steel: .5,
		fairy: .5,
	},
	rock: {
		fire: 2,
		ice: 2,
		fighting: .5,
		ground: .5,
		flying: 2,
		bug: 2,
		steel: .5,
	},
	ghost: {
		normal: 0,
		psychic: 2,
		ghost: 2,
		dark: .5,
	},
	dragon: {
		dragon: 2,
		steel: .5,
		fairy: 0,
	},
	dark: {
		fighting: .5,
		psychic: 2,
		ghost: 2,
		dark: .5,
		fairy: .5,
	},
	steel: {
		fire: .5,
		water: .5,
		electric: .5,
		ice: 2,
		rock: 2,
		steel: .5,
		fairy: 2,
	},
	fairy: {
		fire: .5,
		fighting: 2,
		ground: .5,
		dragon: 2,
		dark: 2,
		steel: .5,
	}
}

const struggle = {
	name: "struggle",
	accuracy: null,
	type: "normal",
	damageClass: "physical",
	power: 50,
	pp: [Infinity, Infinity],
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
	},
	effectChance: null,
	priority: 0,
}

const stats = ['attack', 'defense', 'speed', 'specialAttack', 'specialDefense'];

// Global Variables

let gameOver;
let winner;
let messages;
let message;
let action;
let weather;

// Dom elements

const battleController = document.getElementById('battleactions')
const messageBoxEl = document.getElementById('messagebox');
const opponentName = document.querySelector('#opponentpokemon .name');
const opponentHealthbar = document.querySelector('#opponentpokemon .health-bar');
const opponentHp = document.querySelector('#opponentpokemon .hp');
const opponentSprite = document.querySelector('#opponentpokemon .battlesprite');
const playerName = document.querySelector('#userpokemon .name');
const playerLevel = document.querySelector('#userpokemon span');
const playerHealthbar = document.querySelector('#userpokemon .health-bar');
const playerHp =document.querySelector('#userpokemon .hp');
const playerSprite = document.querySelector('#userpokemon .battlesprite');

// event listeners

battleController.addEventListener('click', messageProgression);

// Callback Functions

function messageProgression(event){ 
	if (!action) {
		action = "main";
	}

	if (action === "main") {
		switch (event.target.innerHTML) {
			case "Fight":
				action = "fight"
				break;
		}
	} else if (action === "fight") {
		if (event.target.classList.contains('move')) {
			action = null;
			turn(event.target.classList[0]);
		}
	}

	if (messages?.length > 0) {
		message = messages.shift();
		if (message.length === 1) {
			action = "main";
		}
	}

	render()
}

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


function turn(playerMove) {
	const pokemonArray = [playerPokemon, opponentPokemon];
	playerMove = playerPokemon.moves.find(move => move.name === playerMove);
	
	if (!playerMove.pp[0]) {
		messages = ["That move is out of PP, select another."];
		return;
	} 

	let opponentMove = aiSelect();

	let firstMove;
	let playerSpeed = playerPokemon.speed.value*stageMultipliers(playerPokemon.speed.state)*((playerPokemon.status.state === "paralysis") ? .5 : 1)
	let opponentSpeed = opponentPokemon.speed.value*stageMultipliers(opponentPokemon.speed.state)*((playerPokemon.status.state === "paralysis") ? .5 : 1)
	if (playerMove.priority === opponentMove.priority) {
		if (playerSpeed === opponentSpeed) {
			firstMove = Math.round(Math.random()) ? "player" : "opponent";
		} else {
			firstMove = (playerSpeed > opponentSpeed) ? "player" : "opponent";
		}
	} else {
		firstMove = (playerMove.priority > opponentMovePriority) ? "player" : "opponent";
	}

	if (firstMove === 'player') {
		bothMoves(playerPokemon, playerMove, opponentPokemon, opponentMove);
	} else {
		bothMoves(opponentPokemon, opponentMove, playerPokemon, playerMove);
	}

}

function bothMoves(firstPokemon, firstMove, secondPokemon, secondMove) {
	move(firstPokemon, firstMove, secondPokemon);

	move(secondPokemon, secondMove, firstPokemon);
}

function move(attacker, move, defender) {
	if (move.damageClass === "physical" || move.damageClass === "special") {
		let burn = 1;
		let attack;
		let defense;
		let random = (Math.random()*15+85)/100;
		let critical = (Math.random() < attacker.critRate.value*(3**(move.meta.crit_rate+attacker.critRate.stage))) ? 1.5 : 1;
		if (move.damageClass === "physical") {
			if (attacker.status.state === "burn") burn = .5
			if (critical === 1.5) {
				attack = attacker.attack.value*stageMultipliers(Math.max(attacker.attack.state, 0));
				defense = defender.defense.value*stageMultipliers(Math.min(defender.defense.state, 0));
			} else {
				attack = attacker.attack.value*stageMultipliers(attacker.attack.state);
				defense = defender.defense.value*stageMultipliers(defender.defense.state);
			}
		} else if (move.damageClass === "special") {
			if (critical === 1.5) {
				attack = attacker.specialAttack.value*stageMultipliers(Math.max(attacker.specialAttack.state, 0));
				defense = defender.specialDefense.value*stageMultipliers(Math.min(defender.specialDefense.state, 0));
			} else {
				attack = attacker.specialAttack.value*stageMultipliers(attacker.specialAttack.state);
				defense = defender.specialDefense.value*stageMultipliers(defender.specialDefense.state);
			}
		}
		let stab = (attacker.types.includes(move.type)) ? 1.2 : 1;
		let type = (defender.types.reduce((total, type) => {
			return total * ((typeof moveDamage[move.type][type] === Number) ? moveDamage[move.type][type] : 1);
		},1))
		console.log(burn, 'burn', attack, 'attack', defense, 'defense', random, 'random', critical, 'critical', stab, 'stab', type, 'type');
		let weatherMult = ((weather.state === "rain" && move.type === "water") || (weather.state === "harsh sunlight" && move.type === "fire")) ? 1.5 : 1;

		let damage = Math.floor(((((2*attacker.level)/5+2)*move.power*attack/defense)/50+2)*weatherMult*critical*random*stab*type*burn);
		console.log(attacker.name, damage)
	}
}

function aiSelect(){
	const ppTotal = opponentPokemon.moves.reduce((sum, move) => sum + move.pp[0], 0);
	if (ppTotal === 0 || opponentPokemon.moves.length === 0) {
		return struggle;
	} else {
		const availableMoves = opponentPokemon.moves.filter(move => move.pp[0] > 0);
		return availableMoves[Math.floor(Math.random*availableMoves.length)];
	}
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
			object[stat] = {
				value: calculateStat(pokemon.data[stat], object.level),
				state: 0
			};
		})

		let hp = calculateHealth(pokemon.data.hp, object.level);

		object.critRate = {
			value: (pokemon.data.speed/4)/256,
			state: 0,
		};
		object.hp = [hp, hp];
		object.accuracy = 0;
		object.evasion = 0;
		object.status = {
			state: "normal",
			duration: Infinity
		};

		object.moves = moves.data;
		object.moves.forEach((move, index) => {
			let level = moveLevel(move.experience);
			object.moves[index].level = level;
			object.moves[index].power = Math.floor(object.moves[index].power*(1+level*.03));
			const pp = Math.floor(object.moves[index].pp*(1+level*.05));
			object.moves[index].pp = [pp, pp];
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

async function init() {
	await getPokemonInfo(playerPokemon, playerId);
	await getPokemonInfo(opponentPokemon, opponentId);

	action = false;
	message = `${opponentName.innerText} appeared.`
	weather = {
		state: "normal", 
		duration: Infinity
	};

	render();
}

function render() {
	playerHp.innerText = `${playerPokemon.hp[0]} / ${playerPokemon.hp[1]}`;
	opponentHp.innerText = `${opponentPokemon.hp[0]} / ${opponentPokemon.hp[1]}`;

	while (messageBoxEl.firstChild) {
		messageBoxEl.removeChild(messageBoxEl.lastChild);
	}

	if (action) {
		messageBoxEl.innerText = null;
		if (action === "main"){
			renderActions();
		} else if (action === "fight"){
			renderMoves();
		}
	} else {
		messageBoxEl.innerText = message;
	}
}

function renderActions() {
	let fightEl = document.createElement('div');
	fightEl.innerText = 'Fight';
	messageBoxEl.append(fightEl);
}

function renderMoves() {
	const ppTotal = playerPokemon.moves.reduce((sum, move) => sum + move.pp[0], 0);
	if (ppTotal === 0 || playerPokemon.moves.length === 0) {
		let moveEl = document.createElement("div");
		let nameEl = document.createElement("div");
		let ppEl = document.createElement("div");

		[moveEl, nameEl, ppEl].forEach(e => {
			e.classList.add(struggle.name)
			e.classList.add("move")
		});

		nameEl.innerText = struggle.name;
		ppEl.innerText = `${struggle.pp[0]}/${struggle.pp[1]}`

		moveEl.append(nameEl);
		moveEl.append(ppEl);
		messageBoxEl.append(moveEl);
	} else {
		playerPokemon.moves.forEach(move => {
			let moveEl = document.createElement("div");
			let nameEl = document.createElement("div");
			let ppEl = document.createElement("div");

			[moveEl, nameEl, ppEl].forEach(e => {
				e.classList.add(move.name)
				e.classList.add("move")				
			});

			if (move.pp[0] < 1) moveEl.style.color = "red";
			nameEl.innerText = move.name;
			ppEl.innerText = `${move.pp[0]}/${move.pp[1]}`

			moveEl.append(nameEl);
			moveEl.append(ppEl);
			messageBoxEl.append(moveEl);
		})
	}
}