import { Glob } from "bun";
import * as path from "path";
import * as fs from "fs";
import { SharedConstGeneratorOptions } from "./generator-options";

/* ======================================================
   Public API
   ====================================================== */

export async function generateSharedConsts(options: SharedConstGeneratorOptions): Promise<void> {
	const { inputGlob, outputDir, javaPackage } = options;

	const files: string[] = [];
	for await (const file of new Glob(inputGlob as string).scan(".")) {
		files.push(file);
	}

	if (files.length === 0) {
		console.warn(`No shared-const TypeScript files matching '${inputGlob}' found.`);
		return;
	}

	fs.mkdirSync(outputDir, { recursive: true });

	console.log('----------- <Constants> -----------');
	for (const file of files) {
		console.log(path.basename(file));
		const module = await import(path.resolve(file));
		generateJavaForModule(module, path.basename(file), outputDir, javaPackage);
	}
	console.log('----------- </Constants> -----------');
}

/* ======================================================
   Core generation
   ====================================================== */

function generateJavaForModule(
	module: Record<string, unknown>,
	tsFileName: string,
	outputDir: string,
	javaPackage: string,
): void {
	const javaTypeName = toJavaTypeName(tsFileName);
	const lines: string[] = [`package ${javaPackage};`, "", `public interface ${javaTypeName} {`, ""];

	for (const [key, value] of Object.entries(module)) {
		if (typeof value === 'string') {
			lines.push(...indent([`String ${key} = "${value}";`]));
		} else if (typeof value === 'object' && value !== null) {
			lines.push(...emitNestedInterface(key, value as Record<string, string>), "");
		}
	}

	lines.push("}");
	fs.writeFileSync(path.join(outputDir, `${javaTypeName}.java`), lines.join("\n"), "utf8");
}

/* ======================================================
   Nested interface emission
   ====================================================== */

function emitNestedInterface(name: string, obj: Record<string, string>): string[] {
	const lines: string[] = [`interface ${name} {`, ""];

	for (const [key, value] of Object.entries(obj)) {
		lines.push(...indent([`String ${key} = "${value}";`]));
	}

	lines.push("}");
	return indent(lines);
}

/* ======================================================
   Utilities
   ====================================================== */

function toJavaTypeName(tsFileName: string): string {
	return tsFileName
		.replace(/\.ts$/, "")
		.split("-")
		.map(p => p.charAt(0).toUpperCase() + p.slice(1))
		.join("");
}

function indent(lines: string[], level = 1): string[] {
	const pad = "    ".repeat(level);
	return lines.map(l => pad + l);
}
