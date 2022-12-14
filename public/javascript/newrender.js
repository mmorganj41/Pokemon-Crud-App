const select = document.querySelector('select[name="url"]');
const pokemonEl = document.querySelectorAll('select[name="url"] > option');
const imageEl = document.getElementById('img');
const nameEl = document.getElementById('name');
const typeEl = document.getElementById('type');

const stats = ['hp','attack','defense','specialAttack','specialDefense','speed'];
const statsEl = {};
stats.forEach(stat => {
	statsEl[stat] = document.getElementById(stat);
});

const statIndices = {
	hp: 0,
	attack: 1,
	defense: 2,
	specialAttack: 3,
	specialDefense: 4,
	speed: 5,
}

const pokemonObj = {};

init().then(() => {
	initialInfo();
	select.addEventListener('change', updateInfo);
});

async function init() {
	for (let option in pokemonEl) {
		
		if (Number(option) >= 0) {
			const pokemon = await axios({
				method: 'get',
				url: pokemonEl[option].value,
			})	
			let newObj = {
				image: pokemon.data.sprites.front_default,
				type: [],
			}
			for (let stat in statIndices) {
				newObj[stat] = pokemon.data.stats[statIndices[stat]].base_stat;
			}
			pokemon.data.types.forEach(t => newObj.type.push(t.type.name));
	
			pokemonObj[pokemonEl[option].text] = newObj;
			
		}
	}
}

function updateInfo(event) {
	let name = event.target.value.match(/(?<=pokemon\/)[a-zA-Z\-]*/)[0];
	renderFromName(name);
}

function initialInfo() {
	let name = select.value.match(/(?<=pokemon\/)[a-zA-Z\-]*/)[0];
	renderFromName(name);
}

function renderFromName(name) {
		let renderInfo = pokemonObj[name];
		imageEl.src = renderInfo.image;
		nameEl.innerText = name;
		while (typeEl.firstChild) {
			typeEl.removeChild(typeEl.lastChild);
		}
		renderInfo.type.forEach(t => {
			let tDiv = document.createElement('div');
			tDiv.textContent = t;
			typeEl.append(tDiv);
		})
		stats.forEach(stat => {
			let value = Math.min(renderInfo[stat], 130)/130*100
			statsEl[stat].style.width = value + '%';
			statsEl[stat].text = value;
	})
}