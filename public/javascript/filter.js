let sorted = {};

const table = document.getElementById('pokemonlist');



table.addEventListener('click', event => {
	if (event.target.tagName !== 'TH') return;
	sorted[event.target.innerText] = !sorted[event.target.innerText]
	switch (event.target.innerText) {
		case "Level":
			sortTable(event.target.innerText, true);
			break;
		default:
			sortTable(event.target.innerText, false);
			break;
	}
})

function sortTable(name, isNumber) {
	let th = table.getElementsByTagName("tr")[0];
	let index = [...th.children].findIndex(e => e.innerText === name);
	let i, a, b, shouldSwitch;

	switching = true;

	while (switching) {
	
		switching = false;
		rows = table.rows;
	
		for (i = 1; i < (rows.length - 1); i++) {
			shouldSwitch = false;
			a = rows[i].getElementsByTagName("TD")[index];
			b = rows[i + 1].getElementsByTagName("TD")[index];
			//check if the two rows should switch place:
			if (isNumber) {
				if (sorted[name]) {
					if (Number(a.textContent) > Number(b.textContent)) {
						shouldSwitch = true;
						break;
					}
				} else {
					if (Number(a.textContent) < Number(b.textContent)) {
						shouldSwitch = true;
						break;
					}
				}
			} else {
				if (sorted[name]) {
					if (a.textContent.toLowerCase() > b.textContent.toLowerCase()) {
						shouldSwitch = true;
						break;
					}
				} else {
					if (a.textContent.toLowerCase() < b.textContent.toLowerCase()) {
						shouldSwitch = true;
						break;
					}
				}
			}
		}
		if (shouldSwitch) {
	
		rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
		switching = true;
    }
  }
}