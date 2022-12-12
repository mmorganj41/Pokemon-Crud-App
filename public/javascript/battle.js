// Constants
const playerId = window.location.pathname.match(/(?<=pokemon\/)\w*(?=\/battle)/i)[0];
const opponentId = document.getElementById('oppid').innerHTML;

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

const mainStatuses = ['none', 'paralysis', 'feeze', 'sleep', 'poison', 'burn'];

const statusImmunities = {
	electric: 'paralysis',
	steel: 'poison',
	poison: 'poison',
	fire: 'burn',
	ice: 'freeze',
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
	},
	base: {},
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

const confusedAttack = {
	name: "confused",
	damageClass: "physical",
	type: 'base',
	accuracy: null,
	power: 40,
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
		crit_rate: null,
		drain: 0,
		flinch_chance: 0,
		healing: 0,
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

const battleController = document.getElementById('battleactions');
const messageBoxEl = document.getElementById('messagebox');
const infoPanelEl = document.getElementById('infopanel');

playerPokemon.elements = {};
opponentPokemon.elements = {};
getPokemonElements(playerPokemon.elements, 'userpokemon');
getPokemonElements(opponentPokemon.elements, 'opponentpokemon');

function getPokemonElements(element, id) {
	element.nameEl = document.querySelector(`#${id} .name h3`);
	element.levelEl = document.querySelector(`#${id} span`);
	element.statusEl = document.querySelector(`#${id} .state`);
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
		p.defending = false;
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
				await updateWinnings(experience);
				break;
			}
			case "lose": {
				let experience = 0;
				await updateWinnings(experience);
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
				await updateWinnings(experience);
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

async function updateWinnings(experience) {
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


		const userData = {};
		userData.money = Math.floor(experience/20);

		console.log(userData);
		const res2 = await axios({
			method: 'put',
			url: `http://localhost:3000/user/money`,
			data: userData,
		});
		
		console.log(res, res2);

		let newLevel = pokemonLevel(playerPokemon.experience);

		if (newLevel !== playerPokemon.level) {
			playerPokemon.level = newLevel;
			prepareMessage(`${playerPokemon.elements.nameEl.innerText} reached level ${playerPokemon.level}.`);
		}

		prepareMessage(`You earned $${userData.money}.`);

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
		prepareMessage("That move is out of PP, select another.");
		gameState = "actions";
		return;
	} else if (playerPokemon.status.disable && playerPokemon.disabledMove === playerMove) {
		if (playerPokemon.status.charging === 1) {
			playerMove = struggle;
		} else {
			prepareMessage("That move is disabled, select another.");
			gameState = "actions";
		}
		return;
	} else if (playerPokemon.status.torment && playerPokemon.previousMove == playerMove) {
		if (playerPokemon.status.charging === 1) {
			playerMove = struggle;
		} else {
			prepareMessage("Cannot use the same move in a row due to torment, select another.");
			gameState = "actions";
		}
		return;
	} 

	let opponentMove = aiSelect();

	let playerSpeed = playerPokemon.speed.value*stageMultipliers(playerPokemon.speed.state)*((playerPokemon.status.main.state === "paralysis") ? .5 : 1)
	let opponentSpeed = opponentPokemon.speed.value*stageMultipliers(opponentPokemon.speed.state)*((opponentPokemon.status.main.state === "paralysis") ? .5 : 1)
	if (playerMove.priority === opponentMove.priority) {
		if (playerSpeed === opponentSpeed) {
			gameState = Math.round(Math.random()) ? "playerMove" : "opponentMove";
		} else {
			gameState = (playerSpeed > opponentSpeed) ? "playerMove" : "opponentMove";
		}
	} else {
		gameState = (playerMove.priority > opponentMove.priority) ? "playerMove" : "opponentMove";
	}

	playerPokemon.currentMove = playerMove;
	opponentPokemon.currentMove = opponentMove;

}

function turnStart() {

}

function turnMove(attacker, defender) {
	if (preAct(attacker, defender)) {
		moveParser(attacker, defender);
	}

	postAct(attacker, defender);
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

function preAct(attacker, defender) {
	let canAct = true;

	for (let state in attacker.status) {
		if (state === 'main') {
			if (attacker.status[state].duration <= 0) {
				attacker.status[state].state = 'none';
				prepareMessage(`${state} wore off.`)
			};
		} else {
			if (attacker.status[state].duration <= 0) {
				attacker.status[state] = undefined;
				prepareMessage(`${state} wore off.`);
				if (state === 'disable') {
					attacker.disabledMove = undefined;
				}
				if (state === 'yawn' && attacker.status.main.state === 'none') {
					prepareMessage(`${attacker.elements.nameEl.innerText} fell asleep.`);
				}
			};
		}	
	}

	if (defender.status.notypeimmunity > 0) {
		defender.evasion.state = Math.max(0, defender.evasion.state);
	}
	if (attacker.status.recharge) {
		prepareMessage(`${attacker.elements.nameEl.innerText} is recharging.`);
		return false
	} else if (attacker.status.flinch > 0) {
		prepareMessage(`${attacker.elements.nameEl.innerText} flinched!`);
		return false;
	} 
	


	switch (attacker.status.main.state) {
		case "freeze":
			if (Math.random()*100 < 20) {
				attacker.status.main.state = "none";
				attacker.status.main.duration = Infinity;
				prepareMessage(`${attacker.elements.nameEl.innerText} was unfrozen!`);

			} else {
				prepareMessage(`${attacker.elements.nameel.innerText} is frozen solid.`);
				canAct = false;
			}
		case "sleep":
			prepareMessage(`${attacker.elements.nameel.innerText} is fast asleep.`);
			canAct = false;
		case "paralysis":
			if (Math.random()*100 < 25)	{
				prepareMessage(`${attacker.elements.nameEl.innerText} is paralyzed and cannot move.`);
				canAct = false;
			} 
	}

	if (canAct) {
		if (attacker.status.confusion){
			prepareMessage(`${attacker.elements.nameEl.innerText} is confused.`);
			if (Math.random()*100 < 50) {
				damageParser(attacker, confusedAttack ,attacker);
				prepareMessage(`${attacker.elements.nameEl.innerText} hurt itself in the confusion.`);
				canAct = false;
			} 
		}
		if (attacker.status.infatuation){
			if (Math.random()*100 < 50)	{
				prepareMessage(`${attacker.elements.nameEl.innerText} is infatuated.`);
				canAct =  false;
			}
		}
	}

	return canAct;
}

function postAct(attacker, defender) {
	attacker.previousMove = attacker.currentMove;

	if (attacker.status.ingrain > 0) {
		let healing = healthRegeneration(attacker, 8.25);
		if (healing !== null) {
			prepareMessage(`${attacker.elements.nameEl.innerText} healed some health.`)
		}
	}

	switch (attacker.status.main.state) {
		case "burn":
			prepareMessage(`${attacker.elements.nameEl.innerText} took damage from its burn.`);
			healthDegeneration(attacker, 12.5);
			break;
		case "poison":
			prepareMessage(`${attacker.elements.nameEl.innerText} took damage from poison.`);
			healthDegeneration(attacker, 12.5);
			break;
	}

	if (attacker.status.leechseed > 0) {
		let previousHealth = attacker.hp[0];
		healthDegeneration(attacker, 12.5);
		healing = previousHealth - attacker.hp[0];
		defender.hp[0] = (healing + defender.hp[0] > defender.hp[1]) ? defender.hp[1] : healing + defender.hp[0];
		prepareMessage(`${attacker.elements.nameEl.innerText} was drained.`);
	}
	if (attacker.status.trap > 0) {
		healthDegeneration(attacker, 8.25);
		prepareMessage(`${attacker.elements.nameEl.innerText} took damage from being trapped.`);
	}
	if (attacker.status.nightmare > 0) {
		if (attacker.status.main.state === 'sleep') {
			healthDegeneration(attacker, 25);
			prepareMessage(`${attacker.elements.nameEl.innerText} is having a nightmare.`);
		} else {
			attacker.status.nightmare = undefined;
		}
	}



	for (let state in attacker.status) {
		if (state === 'main') {
			attacker.status[state].duration --;
		} else {
			attacker.status[state] --;
		}
	}

	if (attacker.status.perishsong === 0) {
		attacker.hp[0] = 0;
	}

}

function healthDegeneration(attacker, percent) {
	let totalHealth = Math.ceil(attacker.hp[0] - percent * attacker.hp[1] / 100);
	if (totalHealth < 0) {
		attacker.hp[0] = 0;
		return false;
	} else {
		attacker.hp[0] = totalHealth;
		return true;
	}
}

function healthRegeneration(attacker, percent) {
	if (attacker.status.healblock > 0) return null;
	let totalHealth = Math.floor(attacker.hp[0] + percent * attacker.hp[1] / 100);
	if (totalHealth > attacker.hp[1]) {
		attacker.hp[0] = attacker.hp[1];
		return false;
	} else {
		attacker.hp[0] = totalHealth;
		return true;
	}
}

function moveParser(attacker, defender) {
	let move = attacker.currentMove;
	move.pp[0] --; 


	if (/user charges/i.test(move.info) && !attacker.status.charging) {
		attacker.status.charging = 2;
		prepareMessage(`${attacker.elements.nameEl.innerText} is charging its attack.`);
		return;
	} else {
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
	}

	prepareMessage(`${attacker.elements.nameEl.innerText} used ${move.name}.`);	

	if (/recharge/i.test(move.info)) {
		attacker.status.recharge = 2;
	} 

	if (/user charges/i.test(move.info)) {
		move.pp[0] ++;
	}

	if (/user/i.test(move.target)) {
		if (move.statchange.length > 0) {
			move.statchange.forEach(s => {
				statBoost(attacker, s);
			})
		} 
	} else {
		let miss = false;

		if (move.accuracy) {
			miss = (Math.random()*100 > move.accuracy*accEvadeMultiplier(attacker.accuracy.state)/accEvadeMultiplier(defender.evasion.state));
			if (miss) prepareMessage('It missed.');
		}

		switch (move.damageClass) {
			case 'status':
				if (!miss) {
					if (move.statchange.length > 0) {
						move.statchange.forEach(s => {
							statBoost(defender, s);
						})
					} 
					ailmentParser(attacker, move, defender);
				}
				break;
			case 'physical':
				if (!miss) {
					damageParser(attacker, move, defender);
					ailmentParser(attacker, move, defender);
				}
				break;
			case 'special':
				if (!miss) {
					damageParser(attacker, move, defender);
					ailmentParser(attacker, move, defender);
				}
				break;
		}
	}

	if (move.meta.healing > 0) {
		let healing = healthRegeneration(attacker, move.meta.healing);
		if (healing) {
			prepareMessage(`${attacker.elements.nameEl.innerText} healed some health.`);
		} else if (healing === false){
			prepareMessage(`${attacker.elements.nameEl.innerText} healed to full.`);
		}
	} else if (move.meta.healing < 0) {
		healthDegeneration(attacker, -move.meta.healing)
		prepareMessage(`${attacker.elements.nameEl.innerText} took some damage from recoil.`);
	}

	if (move.statchange.length > 0) {
		if (Math.random()*100 < move.effectChance) {
			if (/the user's/i.test(move.info)) {
				move.statchange.forEach(s => {
					statBoost(attacker, s);
				})
			} else {
				move.statchange.forEach(s => {
					statBoost(defender, s);
				})
			}
		}
	} 

	function statBoost(pokemon, statChange) {
		let statName = statChange.stat.name.replace(/-[a-z]/, match => match[1].toUpperCase());
		let result = pokemon[statName].state + statChange.change;

		if (result > 6) {
			pokemon[statName].state = 6;
			prepareMessage(`${pokemon.elements.nameEl.innerText}'s ${statChange.stat.name.replace(/-/, ' ')} can't go any higher.`);
		} else if (result < -6) {
			pokemon[statName].state = -6;
			prepareMessage(`${pokemon.elements.nameEl.innerText}'s ${statChange.stat.name.replace(/-/, ' ')} can't go any lower.`);
		} else {
			pokemon[statName].state = result;
			if (statChange.change === 1) {
				prepareMessage(`${pokemon.elements.nameEl.innerText}'s ${statChange.stat.name.replace(/-/, ' ')} increased.`);
			} else if (statChange.change > 1) {
				prepareMessage(`${pokemon.elements.nameEl.innerText}'s ${statChange.stat.name.replace(/-/, ' ')} sharply increased.`);
			} else if (statChange.change === -1) {
				prepareMessage(`${pokemon.elements.nameEl.innerText}'s ${statChange.stat.name.replace(/-/, ' ')} decreased.`);
			} else if (statChange.change < -1) {
				prepareMessage(`${pokemon.elements.nameEl.innerText}'s ${statChange.stat.name.replace(/-/, ' ')} sharply decreased.`);
			}
		}
	}

	function ailmentParser(attacker, move, defender) {
		const name = move.meta.ailment.name.replace('-', '');
		if (name !== "none" && Math.random()*100 < (move.meta.ailment_chance || 100)) {
			if (mainStatuses.includes(name) && defender.status.main.state === "none") {

				let immune = false; 

				defender.types.forEach(type => {
					if (statusImmunities[type] === name) immune = true;
				})

				if (!immune) {
					if (name === 'sleep') {
						prepareMessage(`${defender.elements.nameEl.innerText} has fallen asleep.`)
						defender.status.main.duration = Math.floor(Math.random()*3)+2
					} else if (name === 'paralysis'){
						prepareMessage(`${defender.elements.nameEl.innerText} was paralyzed.`);
					} else {
						prepareMessage(`${defender.elements.nameEl.innerText} was ${name.replace(/e?$/, 'ed')}.`);
					}
					defender.status.main.state = name;
				}
			} else {
				if (name === 'unknown') {

				} else if (name !== 'ingrain' && defender.status[name] === undefined) {
					
					switch (name) {
						case 'confusion':
							prepareMessage(`${defender.elements.nameEl.innerText} was confused.`);
							defender.status[name] = Math.floor(Math.random()*3)+2;
							break;
						case 'infatuation':
							prepareMessage(`${defender.elements.nameEl.innerText} was infatuated.`);
							defender.status[name] = Infinity;
							break;
						case 'trap':
							prepareMessage(`${defender.elements.nameEl.innerText} was trapped.`);
							defender.status[name] = [2, 2, 2, 3, 3, 3, 4, 5][Math.floor(Math.random()*8)];
							break;
						case 'nightmare':
							prepareMessage(`${defender.elements.nameEl.innerText} has a nightmare.`);
							defender.status[name] = Infinity;
							break;
						case 'torment':
							prepareMessage(`${defender.elements.nameEl.innerText} is unable to use the same move twice in a row.`);
							defender.status[name] = Infinity;
							break;
						case 'disable':
							prepareMessage(`${defender.elements.nameEl.innerText}'s ${defender.lastMove} was disabled.`);
							defender.status[name] = Math.floor(Math.random()*3)+4;
							defender.disabledMove = defender.previousMove;
							break;
						case 'yawn':
							if (defender.status.main.state === 'none') {
								prepareMessage(`${defender.elements.nameEl.innerText} is getting sleepy.`);
								defender.status[name] = 1;
							}
							break;
						case 'healblock':
							prepareMessage(`${defender.elements.nameEl.innerText} can't heal.`);
							defender.status[name] = 5;
							break;
						case 'notypeimmunity':
							prepareMessage(`${defender.elements.nameEl.innerText} was sleuthed.`);
							defender.status[name] = Infinity;
							break;
						case 'leechseed':
							if (!defender.types.includes('grass')) {
								prepareMessage(`${defender.elements.nameEl.innerText} was seeded.`);
								defender.status[name] = Infinity;
							}
							break;
						case 'embargo':
							prepareMessage(`${defender.elements.nameEl.innerText} cannot use items.`);
							defender.status[name] = 5;
							break;
						case 'perishsong':
							defender.status[name] = 3;
							attacker.status[name] = 4;
							break;
					}
						
				} else if (name === 'ingrain' && defender.status.ingrain === undefined) {
					defender.status.ingrain = Infinity;
				}
			}
		}
		if (move.meta.flinch_chance > 0) {
			if (Math.random()*100 < move.meta.flinch_chance) {
				defender.status.flinch = 1;
			}
		}
	}
}

function damageParser(attacker, move, defender) {
	let burn = 1;
	let attack;
	let defense;
	let random = (Math.random()*15+85)/100;
	let critical = (Math.random() < attacker.critRate.value*(3**(move.meta.crit_rate+attacker.critRate.stage))) ? 1.5 : 1;
	if (critical === 1.5) prepareMessage('Critical Hit!')
	if (move.damageClass === "physical") {
		if (attacker.status.main.state === "burn") burn = .5
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

	if (move.meta.max_hits > 1) {
		let hits = Math.floor(Math.random()*(move.meta.max_hits-move.meta.min_hits)+move.meta.min_hits);
		prepareMessage(`${move.name} hit ${hits} time(s).`);
		damage *= hits;
	}

	defender.hp[0] = (damage > defender.hp[0]) ? 0 : defender.hp[0]-damage;

	if (move.meta.drain > 0 && attacker.status.healblock === undefined) {
		let drain = Math.round(damage*move.meta.drain/100);
		if (drain) {
			attacker.hp[0] = (drain + attacker.hp[0] > attacker.hp[1]) ? attacker.hp[1] : drain + attacker.hp[0];
			prepareMessage(`${attacker.elements.nameEl.innerText} drained some life.`);
		}
	}

	defender.defending = true;
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
		const availableMoves = opponentPokemon.moves.filter(move => {
			return (move.pp[0] > 0) && !(opponentPokemon.status.disable && opponentPokemon.disabledMove === move) && !(opponentPokemon.status.charging === 1 && opponentPokemon.previousMove !== move) && !(opponentPokemon.status.torment && opponentPokemon.previousMove == move)
		});
		return availableMoves[Math.floor(Math.random()*availableMoves.length)] || struggle;
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
		object.user = pokemon.data.user;
		
		let statTotal = 0;
		stats.forEach(stat => {
			object[stat] = {
				value: calculateStat(pokemon.data[stat], object.level),
				state: 0
			};
			statTotal += Math.round((100+pokemon.data[stat].variation[1])/100*(pokemon.data[stat].base + pokemon.data[stat].variation[0]))
		})

		let hp = calculateHealth(pokemon.data.hp, object.level);
		statTotal += Math.round((100+pokemon.data.hp.variation[1])/100*(pokemon.data.hp.base + pokemon.data.hp.variation[0]));

		object.experienceGain = Math.floor((statTotal)*(1+object.level)/14);

		object.critRate = {
			value: (pokemon.data.speed/4)/256,
			stage: 0,
		};
		object.hp = [hp, hp];
		object.accuracy = {state: 0};
		object.evasion = {state: 0};
		object.status = {main: {
			state: "none",
			duration: Infinity
		}};

		object.moves = moves.data;
		object.moves.forEach((move, index) => {
			let level = moveLevel(move.experience);
			object.moves[index].level = level;
			object.moves[index].power = Math.floor(object.moves[index].power*(1+level*.03));
			const pp = Math.floor(object.moves[index].pp*(1+level*.05));
			object.moves[index].pp = [pp, pp];
		})

		if (object.user === null) {
			await axios({
				method: 'delete',
				url: `http://localhost:3000/api/pokemon/${id}`,
			})
		}

	} catch(err) {
		console.log(err);
	}
	
	function moveLevel(experience) {
		return Math.min(Math.floor(experience ** (1 / 3)), 10);
	}

	function calculateHealth(health, level) {
		return Math.round(((Math.round((100+health.variation[1])/100*(health.base + health.variation[0])))/100 + level + 10)*2);
	}

	function calculateStat(stat, level) {
		return Math.round(((Math.round((100+stat.variation[1])/100*(stat.base + stat.variation[0])))*(level+1))/100 + 5);
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

	[pokemonArray].forEach(p => {
		p.attacking = false;
		p.defending = false;
		p.fainted = false;
	})

	render();
}

function render() {
	infoPanelEl.classList.add('hidden');

	renderHealth();

	while (messageBoxEl.firstChild) {
		messageBoxEl.removeChild(messageBoxEl.lastChild);
	}

	renderAttacking();

	renderDefending();

	renderFainted();

	renderStatus();

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

function renderDefending() {
	pokemonArray.forEach(pokemon => {
		if (pokemon.defending) {
			pokemon.elements.spriteEl.classList.add('defending');
			countdown(pokemon.elements.spriteEl, 'defending');
		} else {
			pokemon.elements.spriteEl.classList.remove('defending');
		}
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
			if (!(playerPokemon.status.charging > 0) || playerPokemon.previousMove === move) {
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
			}
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

function renderStatus() {
	pokemonArray.forEach(pokemon => {
		if (pokemon.status.main.state !== "none") {
			pokemon.elements.statusEl.innerText = pokemon.status.main.state;
		} else {
			pokemon.elements.statusEl.innerText = '';
		}
	});
}