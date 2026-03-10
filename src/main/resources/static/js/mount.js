async function doit(el) {
	const name = el.dataset.island;
	const props = JSON.parse(el.dataset.props || "{}");

	try {
		const {render, h, Cmp} = await import(`/assets/fe/${name}.js`);
		// Step 1: Create a temporary wrapper (DocumentFragment):
		const wrapper = document.createDocumentFragment();

		// Step 2: Render the App into the fragment:
		render(h(Cmp, props), wrapper);

		// Version with only one root element coming in:
/*
		// Step 3: Extract the rendered element:
		const renderedEl = wrapper.firstElementChild;
		if (renderedEl) {
			// Step 4: Replace the original placeholder with the rendered element
			el.replaceWith(renderedEl);
			// Step 5: Run htmx processing on the new element:
			htmx.process(renderedEl);
		}
*/

		// Version with multiple root elements coming in:
		// Step 3: Insert all rendered children before the placeholder
		const parent = el.parentNode;
		let next = el.nextSibling;
		const newNodes = [];
		Array.from(wrapper.childNodes).forEach(node => {
			if (next) {
				parent.insertBefore(node, next); // insert before next sibling
			} else {
				parent.appendChild(node); // explicit append if next is null
			}
			newNodes.push(node);
		});

		// Step 4: Remove the placeholder
		el.remove();

		// Step 5: Run htmx processing on only the new nodes
		newNodes.forEach(node => {
			htmx.process(node);
			_hyperscript.processNode(node);
		});
	} catch (err) {
		console.error(`Failed to mount island "${name}":`, err);
		el.innerHTML = '<div class="alert alert-error">Component could not be loaded.</div>';
	}
}

function processIslands() {
	console.log("processIslands");
	const els = document.body.querySelectorAll('[data-island]:not([processed])')
	els.forEach(async (el) => {
		el.setAttribute('processed', '');
		console.log('island', el.dataset.island);
		doit(el); // do not wait
	});
}

// initial:
processIslands();
document.body.addEventListener("htmx:afterSettle", (evt) => {
	console.log("htmx:afterSettle");
	processIslands(evt.target);
});
