import {watch} from "fs";
import {resolve} from "path";

const scanRoot = resolve(import.meta.dir, "src/main/java");

async function build() {
	const proc = Bun.spawn(["bun", "run", "build"], {
		cwd: import.meta.dir,
		stdout: "inherit",
		stderr: "inherit",
	});
	await proc.exited;
}

async function main() {
	await build();
	console.log(`Watching ${scanRoot} for .ts changes...`);

	let debounce: Timer | null = null;
	watch(scanRoot, {recursive: true}, (event, filename) => {
		if (!filename?.endsWith(".ts")) return;
		if (debounce) clearTimeout(debounce);
		debounce = setTimeout(async () => {
			console.log(`\n${filename} changed, rebuilding...`);
			await build(filename);
		}, 200);
	});
}

await main();

