import {
	Node,
	ObjectLiteralExpression,
	SourceFile,
	TemplateExpression,
} from "ts-morph";
import * as path from "path";
import * as fs from "fs";
import { SharedConstGeneratorOptions } from "./generator-options";

/* ======================================================
   Public API
   ====================================================== */

export function generateSharedConsts(options: SharedConstGeneratorOptions): void {
	const { project, inputGlob, outputDir, javaPackage } = options;

	const sourceFiles = project.addSourceFilesAtPaths(inputGlob);

	if (sourceFiles.length === 0) {
		console.warn(`No shared-const TypeScript files matching '${inputGlob}' found.`);
		return;
	}

	fs.mkdirSync(outputDir, { recursive: true });

	console.log('----------- <Constants> -----------');
	for (const sourceFile of sourceFiles) {
		console.log(sourceFile.getBaseName());
		generateJavaForFile(sourceFile, outputDir, javaPackage);
	}
	console.log('----------- </Constants> -----------');
}

/* ======================================================
   Core generation
   ====================================================== */

function generateJavaForFile(
	sourceFile: SourceFile,
	outputDir: string,
	javaPackage: string
): void {
	const javaTypeName = toJavaTypeName(path.basename(sourceFile.getFilePath()));
	const lines: string[] = [`package ${javaPackage};`, "", `public interface ${javaTypeName} {`, ""];

	for (const stmt of sourceFile.getVariableStatements()) {
		for (const decl of stmt.getDeclarations()) {
			const init = decl.getInitializer();
			if (!init) continue;

			if (Node.isStringLiteral(init)) {
				lines.push(...indent([`String ${decl.getName()} = "${init.getLiteralText()}";`]));
			} else if (stmt.isExported() && Node.isObjectLiteralExpression(init)) {
				lines.push(...emitNestedInterface(decl.getName(), init), "");
			}
		}
	}

	lines.push("}");
	fs.writeFileSync(path.join(outputDir, `${javaTypeName}.java`), lines.join("\n"), "utf8");
}

/* ======================================================
   Nested interface emission
   ====================================================== */

function emitNestedInterface(interfaceName: string, obj: ObjectLiteralExpression): string[] {
	const lines: string[] = [`interface ${interfaceName} {`, ""];

	for (const prop of obj.getProperties()) {
		if (!Node.isPropertyAssignment(prop)) continue;
		lines.push(...indent([`String ${prop.getName()} = ${emitJavaExpression(prop.getInitializerOrThrow())};`]));
	}

	lines.push("}");
	return indent(lines);
}

/* ======================================================
   Java expression emission
   ====================================================== */

function emitJavaExpression(initializer: Node): string {
	if (Node.isStringLiteral(initializer)) return `"${initializer.getLiteralText()}"`;
	if (Node.isTemplateExpression(initializer)) return emitTemplateExpression(initializer);
	throw new Error(`Unsupported initializer: ${initializer.getKindName()}`);
}

function emitTemplateExpression(expr: TemplateExpression): string {
	const parts: string[] = [];

	const headText = expr.getHead().getLiteralText();
	if (headText.length > 0) parts.push(`"${headText}"`);

	for (const span of expr.getTemplateSpans()) {
		parts.push(span.getExpression().getText());
		const literalText = span.getLiteral().getLiteralText();
		if (literalText.length > 0) parts.push(`"${literalText}"`);
	}

	return parts.join(" + ");
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
