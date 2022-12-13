const health = document.getElementById('health');
const energy = document.getElementById('energy');
const hunger = document.getElementById('hunger');
const bars = [health, energy, hunger];

function confirmSubmit() {
	return confirm('Confirm Purchase');
}

renderBars();

function renderBars() {
	bars.forEach(e => {
		let value = e.dataset.value
		e.style.width = value + '%';
		if (value < 25) {
			e.classList.add("criticalhealth");
		} else if (value < 50) {
			e.classList.add("lowhealth");
		} 		
	})
}