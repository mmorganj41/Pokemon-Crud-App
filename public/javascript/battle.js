// Constants

const playerId = window.location.pathname.match(/(?<=pokemon\/)\w*(?=\/battle)/i)[0];
const opponentId = window.location.pathname.match(/(?<=battle\/)\w*/)[0];

const playerPokemon = {};
const opponentPokemon = {};

const delay = 4;

const pokemonArray = [playerPokemon, opponentPokemon] 

const damageClasses = ['physical', 'special', 'status']

const battlePath = {
	start: 'actions',
	actions: ['fight', 'info'],
	info: ['pokemon', 'moves'],
	fight: ['playerMove', 'opponentMove'],
	playerMove: ['opponentMove', 'actions', 'gameOver'],
	opponentMove: ['playerMove', 'actions', 'gameOver'],
	gameOver: ['win', 'lose', 'draw'],
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
let gainedExperience;
let move;

// Dom elements

const battleController = document.getElementById('battleactions')
const messageBoxEl = document.getElementById('messagebox');
const infoPanelEl = document.getElementById('infopanel');

playerPokemon.elements = {};
opponentPokemon.elements = {};
getPokemonElements(playerPokemon.elements, 'userpokemon');
getPokemonElements(opponentPokemon.elements, 'opponentpokemon');

function getPokemonElements(element, id) {
	element.nameEl = document.querySelector(`#${id} .name`);
	element.levelEl = document.querySelector(`#${id} span`);
	element.hpEl =document.querySelector(`#${id} .hp`);
	element.spriteEl = document.querySelector(`#${id} .battlesprite`);
	element.barEl = document.querySelector(`#${id} .bar`);
	element.hitEl = document.querySelector(`#${id} .hit`);
}

// event listeners

battleController.addEventListener('click', messageProgression);

// Callback Functions

async function messageProgression(event){ 
	pokemonArray.forEach(p => {
		p.attacking = false;
	})

	if (messageArray.length > 0) {
		message = messageArray.shift();
	} else {
		switch (gameState) {
			case "start":
				gameState = battlePath[gameState];
				break;
			case "actions":
				if (event.target.innerText === "Fight") {
					gameState = battlePath[gameState][0];
				} else if (event.target.innerText == "Info") {
					gameState = battlePath[gameState][1];
				} 				
				break;
			case "fight":
				if (event.target.classList.contains('move')) {
					turnParser(event.target.classList[0]);
					if (gameState === 'playerMove') {
						turnMove(playerPokemon, opponentPokemon);

					} else if (gameState === 'opponentMove'){
						turnMove(opponentPokemon, playerPokemon);
	
					}
				} else if (event.target.id === "back") {
					gameState = "actions";
				}
				break;
			case "playerMove": 
				turnMove(playerPokemon, opponentPokemon);
				
				break;
			case "opponentMove": {
				turnMove(opponentPokemon, playerPokemon)

				break;
			}
			case "info":
				if (event.target.innerText === "Pokemon") {
					gameState = battlePath[gameState][0];
				} else if (event.target.innerText == "Moves") {
					gameState = battlePath[gameState][1];
				} else if (event.target.id === "back") {
					gameState = "actions";
				}
				break;
			case "pokemon":
				if (event.target.id === "back") {
					gameState = "info";
				}
				break;
			case "moves":
				if (event.target.classList.contains('move')) {
					move = playerPokemon.moves.find(m =>  event.target.classList.contains(m.name));
					gameState = 'onemove';
				} else if (event.target.id === "back") {
					gameState = "info";
				}
				break;
			case "onemove":
				if (event.target.classList.contains('move')) {
					move = playerPokemon.moves.find(m =>  event.target.classList.contains(m.name));
				} else if (event.target.id === "back") {
					gameState = "moves";
				}
				break;
			case "gameOver": {
				endGame();
				break;
			}
			case "win": {
				let experience = opponentPokemon.experienceGain;
				await updateExperience(experience);
				break;
			}
			case "lose": {
				let experience = 0;
				await updateExperience(experience);
				break;
			}
			case "draw": {
				pokemonArray.forEach(p => {
					if (!p.faintFirst) {
						prepareMessage(`${p.elements.nameEl.innerText} fainted.`);
						p.fainted = true;
					}
				})
				let experience = Math.round(opponentPokemon.experienceGain/2);
				await updateExperience(experience);
				break;
			}
			case "redirect": {
				window.location.assign(`http://localhost:3000/pokemon/${playerId}/battle`);
				break;
			}
		}
	}

	render()
}

// Helper Functions

async function updateExperience(experience) {
	if (!gainedExperience) {
		playerPokemon.experience += experience;

		let expMessage = (experience) ? `Gained ${experience} experience.` : 'Try again.'
		prepareMessage(expMessage);

		const data = {};
		data.experience = playerPokemon.experience;
		data.moves = [];
		playerPokemon.moves.forEach(move => {
			move.experience += Math.floor(experience/10);
			data.moves.push({
				id: move._id,
				experience: move.experience,
			});
		})

		gainedExperience = true;
		const res = await axios({
			method: 'put',
			url: `http://localhost:3000/pokemon/${playerId}`,
			data,
		});
		
		console.log(res);

		let newLevel = pokemonLevel(playerPokemon.experience);

		if (newLevel !== playerPokemon.level) {
			playerPokemon.level = newLevel;
			prepareMessage(`${playerPokemon.elements.nameEl.innerText} reached level ${playerPokemon.level}.`);
		}

		gameState = 'redirect';
	}
}

function prepareMessage(text) {
	(message) ? messageArray.push(text) : message = text;
} 

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
		gameState = (playerMove.priority > opponentMove.priority) ? "playerMove" : "opponentMove";
		console.log(gameState);
	}

	playerPokemon.currentMove = playerMove;
	opponentPokemon.currentMove = opponentMove;

}

function turnMove(attacker, defender) {
	moveParser(attacker, defender);

	if (attacker.hp[0] <= 0 || defender.hp[0] <= 0) {
		gameState = battlePath[gameState][2]
		if (defender.hp[0] <= 0) {
			defender.faintFirst = true;
		} else {
			attacker.faintFirst = true;
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
	prepareMessage(`${attacker.elements.nameEl.innerText} used ${move.name}.`);
	
	switch (move.damageClass) {
		case damageClasses[0]:
			attacker.attacking = damageClasses[0];
			break;
		case damageClasses[1]:
			attacker.attacking = damageClasses[1];
			break;
		case damageClasses[2]:
			attacker.attacking = damageClasses[2];
			break;
	}

	if (move.damageClass === "physical" || move.damageClass === "special") {
		let burn = 1;
		let attack;
		let defense;
		let random = (Math.random()*15+85)/100;
		let critical = (Math.random() < attacker.critRate.value*(3**(move.meta.crit_rate+attacker.critRate.stage))) ? 1.5 : 1;
		if (critical === 1.5) prepareMessage('Critical Hit!')
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
			prepareMessage("It has no effect.");
		} else if (type < 1) {
			prepareMessage("It's not very effective.");
		} else if (type > 1) {
			prepareMessage("It's super effective!");
		}

		let weatherMult = ((weather.state === "rain" && move.type === "water") || (weather.state === "harsh sunlight" && move.type === "fire")) ? 1.5 : 1;

		let damage = Math.floor(((((2*attacker.level)/5+2)*move.power*attack/defense)/50+2)*weatherMult*critical*random*stab*type*burn);

		defender.hp[0] = (damage > defender.hp[0]) ? 0 : defender.hp[0]-damage;
	}
}

function endGame() {
	if (playerPokemon.hp[0] <= 0 && opponentPokemon.hp[0] <= 0) {
		pokemonArray.forEach(p => {
			if (p.faintFirst) {
				prepareMessage(`${p.elements.nameEl.innerText} fainted.`);
				gameState = battlePath[gameState][2];
				p.fainted = true;
			}
		})
	} else if (playerPokemon.hp[0] <= 0) {
		prepareMessage(`${playerPokemon.elements.nameEl.innerText} fainted.`);
		gameState = battlePath[gameState][1];
		playerPokemon.fainted = true;
	} else if (opponentPokemon.hp[0] <= 0) {
		prepareMessage(`${opponentPokemon.elements.nameEl.innerText} fainted.`);
		gameState = battlePath[gameState][0];
		opponentPokemon.fainted = true;
	} else {
		prepareMessage('error.');
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
		object.trainer = pokemon.data.trainer;
		object.images = pokemon.data.images;
		object.nature = pokemon.data.nature;
		
		let statTotal = 0;
		stats.forEach(stat => {
			object[stat] = {
				value: calculateStat(pokemon.data[stat], object.level),
				state: 0
			};
			statTotal += pokemon.data[stat]
		})

		let hp = calculateHealth(pokemon.data.hp, object.level);
		statTotal += pokemon.data.hp;

		object.experienceGain = Math.floor((statTotal)*(1+object.level)/14);

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

function pokemonLevel(experience) {
	return Math.min(Math.floor(experience ** (1 / 3)), 100);
}


// Main Functions

init();

async function init() {
	await getPokemonInfo(playerPokemon, playerId);
	await getPokemonInfo(opponentPokemon, opponentId);

	gainedExperience = false;
	gameState = 'start';
	messageArray = [];
	prepareMessage(`${opponentPokemon.elements.nameEl.innerText} appeared.`);
	weather = {
		state: "normal", 
		duration: Infinity
	};
	playerPokemon.priorHealthValues = playerPokemon.hp[0];
	opponentPokemon.priorHealthValues = opponentPokemon.hp[0];
	playerPokemon.attacking = false;
	opponentPokemon.attacking = false;
	playerPokemon.fainted = false;
	opponentPokemon.fainted = false;

	render();
}

function render() {
	infoPanelEl.classList.add('hidden');

	renderHealth();

	while (messageBoxEl.firstChild) {
		messageBoxEl.removeChild(messageBoxEl.lastChild);
	}

	renderAttacking();

	renderFainted();

	renderLevelUp();

	messageBoxEl.innerText = message;
		
	if (!message) {
		messageBoxEl.innerText = null;
		switch (gameState) {
			case "actions":
				renderActions();
				break;
			case "fight":
				renderMoves();
				break;
			case "info":
				renderInfo();
				break;
			case "pokemon":
				renderPokemon();
				break;
			case "moves":
				renderMoves();
				break; 
			case "onemove":
				renderOneMove();
				break;
		}
	} 
	message = null;

}

function renderLevelUp() {
	playerPokemon.elements.levelEl.innerText = playerPokemon.level;
}

function countdown(element, className) {
	let time = delay;
	const countdown = setInterval(() => {
		if (time <= 0) {
			element.classList.remove(className);
					
			clearInterval(countdown)    
		}
		time --;
	}, 200);
}

function renderAttacking() {
	pokemonArray.forEach(pokemon => {
		damageClasses.forEach(type => {
			if (pokemon.attacking === type) {
				pokemon.elements.spriteEl.classList.add(type);
				countdown(pokemon.elements.spriteEl, type);
			} else {
				pokemon.elements.spriteEl.classList.remove(type);
			}
		})
	})
}

function renderFainted() {
	pokemonArray.forEach(pokemon => {
		if (pokemon.fainted) {
			pokemon.elements.spriteEl.classList.add("fainted");
			countdown(pokemon.elements.spriteEl);
		} 
	})
}

function renderHealth() {
	pokemonArray.forEach(pokemon => {
		let currentHealth = pokemon.hp[0];

		const healthbar = {
			barWidth: (currentHealth / pokemon.hp[1]) * 100,
			hitWidth: ((pokemon.priorHealthValues - currentHealth) / pokemon.priorHealthValues) * 100 + "%",
		}
		if(pokemon.priorHealthValues !== currentHealth) {
	
			pokemon.elements.hitEl.style.width = healthbar.hitWidth;
	
			setTimeout(() => {
				pokemon.elements.hitEl.style.width = 0;
				pokemon.elements.barEl.style.width = healthbar.barWidth + "%";
				let healthpercent = parseFloat(pokemon.elements.barEl.style.width);
				if (healthpercent < 25) {
					pokemon.elements.barEl.classList.add("criticalhealth");
					pokemon.elements.barEl.classList.remove("lowhealth");
				} else if (healthpercent < 50) {
					pokemon.elements.barEl.classList.remove("criticalhealth");
					pokemon.elements.barEl.classList.add("lowhealth");
				} else {
					pokemon.elements.barEl.classList.remove("criticalhealth");
					pokemon.elements.barEl.classList.remove("lowhealth");
				}
			}, 500);

		}
		pokemon.elements.hpEl.innerText = `${pokemon.hp[0]} / ${pokemon.hp[1]}`;

		pokemon.priorHealthValues = currentHealth;
	})
}

function renderActions() {
	battlePath.actions.forEach(name => {
		const element = document.createElement('div');
		element.innerText = name.replace(/^[a-z]/, (letter) => letter.toUpperCase());
		messageBoxEl.append(element);
	})
}

function renderInfo() {
	battlePath.info.forEach(name => {
		const element = document.createElement('div');
		element.innerText = name.replace(/^[a-z]/, (letter) => letter.toUpperCase());
		messageBoxEl.append(element);
	})

	renderBackButton();
}

function renderPokemon() {
	infoPanelEl.classList.remove("hidden");
	infoPanelEl.innerHTML = `<div><div id="sprite">
		<div><img src="${playerPokemon.images[0]}" alt="${playerPokemon.images[0]}"></div><div><h3>${playerPokemon.name[0].toUpperCase() + playerPokemon.name.substring(1, playerPokemon.name.length)}</h3></div>
	</div>
	<div>
		<div>
			<div><h3>Info</h3></div>
			<div>
				<div><div>Nickname:&nbsp;</div><div>${playerPokemon.elements.nameEl.innerText}</div></div>
				<div><div>Level:&nbsp;</div><div>${playerPokemon.level}(${playerPokemon.experience})</div></div>
				<div><div>Type:&nbsp;</div><div id="types">
					<div>${playerPokemon.types[0]}</div><div>${playerPokemon.types[1] || ''}</div>
				</div></div>
				<div><div>Nature:&nbsp;</div><div>${playerPokemon.nature}</div></div>
				<div><div>Trainer:&nbsp;</div><div>${playerPokemon.trainer}</div></div>
			</div>
		</div>
		<div>
			<div><h3>Stats</h3></div>
			<div>
				<div><div>HP:&nbsp;</div><div>${playerPokemon.hp[1]}</div></div>
				<div><div>ATK:&nbsp;</div><div>${playerPokemon.attack.value}</div></div>
				<div><div>DEF:&nbsp;</div><div>${playerPokemon.defense.value}</div></div>
				<div><div>SPD:&nbsp;</div><div>${playerPokemon.speed.value}</div></div>
				<div><div>SATK:&nbsp;</div><div>${playerPokemon.specialAttack.value}</div></div>
				<div><div>SDEF:&nbsp;</div><div>${playerPokemon.specialDefense.value}</div></div>
			</div>
		</div>
	</div>
</div>`;

	renderBackButton();
}

function renderOneMove() {
	renderMoves();
	infoPanelEl.classList.remove("hidden");
	infoPanelEl.innerHTML = `<div><div id="movetable">
		<table >
			<tr>
				<th>Name</th>
				<th>Type</th>
				<th>Class</th>
			</tr>
				<td>${move.name}</td>
				<td>${move.type} </td>
				<td>${move.damageClass} </td>
			</tr>
				<th>Power</th>
				<th>PP</th>
				<th>Level</th>
			<tr>
			<tr>
				<td>${move.power}</td>
				<td>${move.pp[0]}/${move.pp[1]} </td>
				<td>${move.level} (${move.experience})</td>
			</tr>		
		</table>
		<div id="moveinfo">
			<div class="headers">Info</div>
			<div id="info">${move.info} </div>
		</div>
	</div>
</div>`;

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
	renderBackButton();
}

function renderBackButton() {
	let backEl = document.createElement("div");
	backEl.innerText = "⇚ Back";
	backEl.id = 'back';
	messageBoxEl.append(backEl);
}