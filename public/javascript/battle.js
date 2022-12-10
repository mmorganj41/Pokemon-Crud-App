// Constants

const playerId = window.location.pathname.match(/(?<=pokemon\/)\w*(?=\/battle)/i)[0];
const opponentId = window.location.pathname.match(/(?<=battle\/)\w*/)[0];

const playerPokemon = {};
const opponentPokemon = {};

const battlePath = {
	start: 'actions',
	actions: 'fight',
	fight: ['playerMove', 'opponentMove'],
	playerMove: ['opponentMove', 'actions', 'gameOver'],
	opponentMove: ['playerMove', 'actions', 'gameOver'],
}

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

let message;
let gameState;
let weather;
let firstClick;
let firstMove;
let movesForTurn;
let messageArray;
let previousMessage;

// Dom elements

const battleController = document.getElementById('battleactions')
const messageBoxEl = document.getElementById('messagebox');
const opponentName = document.querySelector('#opponentpokemon .name');
const opponentHealthbar = document.querySelector('#opponentpokemon .health-bar');
const opponentBar = document.querySelector('#opponentpokemon .bar');
const opponentHit = document.querySelector('#opponentpokemon .hit');
const opponentHp = document.querySelector('#opponentpokemon .hp');
const opponentSprite = document.querySelector('#opponentpokemon .battlesprite');
const playerName = document.querySelector('#userpokemon .name');
const playerLevel = document.querySelector('#userpokemon span');
const playerHealthbar = document.querySelector('#userpokemon .health-bar');
const playerHp =document.querySelector('#userpokemon .hp');
const playerSprite = document.querySelector('#userpokemon .battlesprite');
const playerBar = document.querySelector('#userpokemon .bar');
const playerHit = document.querySelector('#userpokemon .hit');

// event listeners

battleController.addEventListener('click', messageProgression);

// Callback Functions

function messageProgression(event){ 

	if (messageArray.length > 0) {
		message = messageArray.shift();
	} else {
		switch (gameState) {
			case "start":
				gameState = battlePath[gameState];
				break;
			case "actions":
				gameState = battlePath[gameState];
				break;
			case "fight":
				if (event.target.classList.contains('move')) {
					turnParser(event.target.classList[0]);
					if (gameState === 'playerMove') {
						turnMove(playerPokemon, opponentPokemon);

					} else if (gameState === 'opponentMove'){
						turnMove(opponentPokemon, playerPokemon);
	
					}
				}
				break;
			case "playerMove": 
				turnMove(playerPokemon, opponentPokemon);
				
				break;
			case "opponentMove": {
				turnMove(opponentPokemon, playerPokemon)

				break;
			}
			case "gameOver": {
				endGame();
			}
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


function turnParser(playerMove) {
	firstMove = true;
	const pokemonArray = [playerPokemon, opponentPokemon];
	playerMove = playerPokemon.moves.find(move => move.name === playerMove) || struggle;
	
	if (!playerMove.pp[0]) {
		message = "That move is out of PP, select another.";
		gameState = "actions";
		return;
	} 

	let opponentMove = aiSelect();

	let playerSpeed = playerPokemon.speed.value*stageMultipliers(playerPokemon.speed.state)*((playerPokemon.status.state === "paralysis") ? .5 : 1)
	let opponentSpeed = opponentPokemon.speed.value*stageMultipliers(opponentPokemon.speed.state)*((playerPokemon.status.state === "paralysis") ? .5 : 1)
	if (playerMove.priority === opponentMove.priority) {
		if (playerSpeed === opponentSpeed) {
			gameState = Math.round(Math.random()) ? "playerMove" : "opponentMove";
		} else {
			gameState = (playerSpeed > opponentSpeed) ? "playerMove" : "opponentMove";
		}
	} else {
		gameState = (playerMove.priority > opponentMove.Priority) ? "playerMove" : "opponentMove";
	}

	playerPokemon.currentMove = playerMove;
	opponentPokemon.currentMove = opponentMove;

}

function turnMove(attacker, defender) {
	moveParser(attacker, defender);
	
	message = messageArray.shift();

	if (attacker.hp[0] <= 0 || defender.hp[0] <= 0) {
		gameState = battlePath[gameState][2]
		if (defender.hp[0] <= 0) {
			messageArray.push(`${defender.name} fainted.`);
		}
		if (attacker.hp[0] <= 0) {
			messageArray.push(`${attacker.name} fainted.`);
		}
	} else if (firstMove) {
		firstMove = false;
		gameState = battlePath[gameState][0];
	} else {
		gameState = battlePath[gameState][1];
	}
}

function moveParser(attacker, defender) {
	let move = attacker.currentMove;
	messageArray.push([`${attacker.name} used ${move.name}.`]);
	if (move.damageClass === "physical" || move.damageClass === "special") {
		let burn = 1;
		let attack;
		let defense;
		let random = (Math.random()*15+85)/100;
		let critical = (Math.random() < attacker.critRate.value*(3**(move.meta.crit_rate+attacker.critRate.stage))) ? 1.5 : 1;
		if (critical === 1.5) messageArray.push('Critical Hit.')
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
			return total * ((typeof moveDamage[move.type][type] === "number") ? moveDamage[move.type][type] : 1);
		},1))
		if (type === 0) {
			messageArray.push("It has no effect.");
		} else if (type < 1) {
			messageArray.push("It's not very effective.");
		} else if (type > 1) {
			messageArray.push("It's super effective!");
		}

		let weatherMult = ((weather.state === "rain" && move.type === "water") || (weather.state === "harsh sunlight" && move.type === "fire")) ? 1.5 : 1;

		let damage = Math.floor(((((2*attacker.level)/5+2)*move.power*attack/defense)/50+2)*weatherMult*critical*random*stab*type*burn);

		defender.hp[0] = (damage > defender.hp[0]) ? 0 : defender.hp[0]-damage;
	}
}

function endGame() {
	if (playerPokemon.hp[0] <= 0 && opponentPokemon.hp[0] <= 0) {
		
	} else if (playerPokemon.hp[0] <= 0) {

	} else if (opponentPokemon.hp[0] <= 0) {

	} else {

	}
}

function aiSelect(){
	const ppTotal = opponentPokemon.moves.reduce((sum, move) => sum + move.pp[0], 0);
	if (ppTotal === 0 || opponentPokemon.moves.length === 0) {
		return struggle;
	} else {
		const availableMoves = opponentPokemon.moves.filter(move => move.pp[0] > 0);
		return availableMoves[Math.floor(Math.random()*availableMoves.length)];
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
			stage: 0,
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


	gameState = 'start';
	messageArray = [];
	message = `${opponentName.innerText} appeared.`
	weather = {
		state: "normal", 
		duration: Infinity
	};
	playerPokemon.priorHealthValues = playerPokemon.hp[0];
	opponentPokemon.priorHealthValues = opponentPokemon.hp[0];


	render();
}

function render() {
	renderHealth();

	while (messageBoxEl.firstChild) {
		messageBoxEl.removeChild(messageBoxEl.lastChild);
	}

	if (previousMessage = message) {
		messageBoxEl.innerText = message;
		message = null;
	} else {
		messageBoxEl.innerText = null;
		if (gameState === "actions"){
			renderActions();
		} else if (gameState === "fight"){
			renderMoves();
		}
	} 

	previousMessage = messageBoxEl.innerText;
}

function renderHealth() {
	currentPlayerHealth = playerPokemon.hp[0];
	currentOpponentHealth = opponentPokemon.hp[0];

	const player = {
		barWidth: (currentPlayerHealth / playerPokemon.hp[1]) * 100,
    	hitWidth: ((playerPokemon.priorHealthValues - currentPlayerHealth) / playerPokemon.priorHealthValues) * 100 + "%",
	}

	const opponent = {
		barWidth: (currentOpponentHealth / opponentPokemon.hp[1]) * 100,
    	hitWidth: ((opponentPokemon.priorHealthValues  - currentOpponentHealth) / opponentPokemon.priorHealthValues) * 100 + "%",
	}

	if(playerPokemon.priorHealthValues !== currentPlayerHealth || opponentPokemon.priorHealthValues !== currentOpponentHealth) {
	
		playerHit.style.width = player.hitWidth;
		opponentHit.style.width = opponent.hitWidth;

		setTimeout(() => {
			playerHit.style.width = 0;
			playerBar.style.width = player.barWidth + "%";
			opponentHit.style.width = 0;
			opponentBar.style.width = opponent.barWidth + "%";
		}, 500);
	}

	playerHp.innerText = `${playerPokemon.hp[0]} / ${playerPokemon.hp[1]}`;
	opponentHp.innerText = `${opponentPokemon.hp[0]} / ${opponentPokemon.hp[1]}`;

	playerPokemon.priorHealthValues= currentPlayerHealth;
	opponentPokemon.priorHealthValues = currentOpponentHealth;
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