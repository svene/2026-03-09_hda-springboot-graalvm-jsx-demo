import {
	Project,
	Node,
	SyntaxKind,
	TemplateExpression,
	SourceFile,
} from "ts-morph";
import * as path from "path";
import * as fs from "fs";
import {SharedConstGeneratorOptions} from "./generator-options";

/* ======================================================
   Public API
   ====================================================== */

export function generateSharedConsts(options: SharedConstGeneratorOptions): void {
	const {
		tsConfigPath,
		inputGlob,
		outputDir,
		javaPackage,
	} = options;

	const project = new Project({
		tsConfigFilePath: tsConfigPath,
	});

	const sourceFiles = project.addSourceFilesAtPaths(inputGlob);

	if (sourceFiles.length === 0) {
		console.warn(`No shared-const TypeScript files matching '${inputGlob}' found.`);
		return;
	}

	fs.mkdirSync(outputDir, { recursive: true });

	console.log('----------- <Constants> -----------')
	for (const sourceFile of sourceFiles) {
		console.log(`${sourceFile.getBaseName().toString()}`)
		generateJavaForFile(sourceFile, outputDir, javaPackage);
	}
	console.log('----------- </Constants> -----------')
}

/* ======================================================
   Core generation
   ====================================================== */

function generateJavaForFile(
	sourceFile: SourceFile,
	outputDir: string,
	javaPackage: string
): void {
	const tsFileName = path.basename(sourceFile.getFilePath());
	const javaTypeName = toJavaTypeName(tsFileName);
	const javaFilePath = path.join(outputDir, `${javaTypeName}.java`);

	const lines: string[] = [];

	lines.push(`package ${javaPackage};`, "");
	lines.push(`public interface ${javaTypeName} {`, "");

	// ─────────────────────────────────────────────
	// Top-level string constants
	// ─────────────────────────────────────────────

	sourceFile.getVariableDeclarations().forEach(decl => {
		const init = decl.getInitializer();
		if (!init) return;

		if (Node.isStringLiteral(init)) {
			lines.push(
				...indent([
					`String ${decl.getName()} = "${init.getLiteralText()}";`,
				])
			);
		}
	});

	if (lines[lines.length - 1] !== "") {
		lines.push("");
	}

	// ─────────────────────────────────────────────
	// Exported object literals → nested interfaces
	// ─────────────────────────────────────────────

	sourceFile.getVariableStatements().forEach(stmt => {
		if (!stmt.isExported()) return;

		stmt.getDeclarations().forEach(decl => {
			const obj = decl.getInitializerIfKind(
				SyntaxKind.ObjectLiteralExpression
			);
			if (!obj) return;

			lines.push(
				...emitNestedInterface(decl.getName(), obj),
				""
			);
		});
	});

	lines.push("}");

	fs.writeFileSync(javaFilePath, lines.join("\n"), "utf8");
}

/* ======================================================
   Nested interface emission
   ====================================================== */

function emitNestedInterface(
	interfaceName: string,
	objectLiteral: any
): string[] {
	const lines: string[] = [];

	lines.push(`interface ${interfaceName} {`, "");

	objectLiteral.getProperties().forEach((prop: any) => {
		if (!Node.isPropertyAssignment(prop)) return;

		const key = prop.getName();
		const init = prop.getInitializer();
		if (!init) return;

		const javaExpr = emitJavaExpression(init);

		lines.push(
			...indent([`String ${key} = ${javaExpr};`])
		);
	});

	lines.push("}");

	return indent(lines);
}

/* ======================================================
   Java expression emission
   ====================================================== */

function emitJavaExpression(initializer: any): string {
	if (Node.isStringLiteral(initializer)) {
		return `"${initializer.getLiteralText()}"`;
	}

	if (Node.isTemplateExpression(initializer)) {
		return emitTemplateExpression(initializer);
	}

	throw new Error(
		`Unsupported initializer: ${initializer.getKindName()}`
	);
}

function emitTemplateExpression(expr: TemplateExpression): string {
	const parts: string[] = [];

	// head literal
	const headText = expr.getHead().getLiteralText();
	if (headText.length > 0) {
		parts.push(`"${headText}"`);
	}

	for (const span of expr.getTemplateSpans()) {
		// ${EXPR}
		parts.push(span.getExpression().getText());

		// trailing literal
		const literalText = span.getLiteral().getLiteralText();
		if (literalText.length > 0) {
			parts.push(`"${literalText}"`);
		}
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
