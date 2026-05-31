import { Type } from "ts-morph";
import * as fs from "fs";
import { SharedConstGeneratorOptions } from "./generator-options";

function mapType(type: Type): string {
	if (type.isString()) return "String";
	if (type.isNumber()) return "int";
	if (type.isBoolean()) return "boolean";
	if (type.isArray()) return `List<${mapType(type.getArrayElementTypeOrThrow())}>`;

	const aliasSymbol = type.getAliasSymbol();
	if (aliasSymbol) return aliasSymbol.getName();

	const symbol = type.getSymbol();
	if (symbol) return symbol.getName();

	throw new Error(`Unsupported DTO type: ${type.getText()}`);
}

export function genJavaRecordsFromHonoTypes(options: SharedConstGeneratorOptions): void {
	const { project, inputGlob, javaPackage, outputDir } = options;

	fs.mkdirSync(outputDir, { recursive: true });

	console.log('----------- <Types> -----------');
	for (const source of project.addSourceFilesAtPaths(inputGlob)) {
		for (const alias of source.getTypeAliases()) {
			const name = alias.getName();
			console.log(name);

			let needsList = false;
			const fields = alias.getType().getProperties().map(p => {
				const javaType = mapType(p.getValueDeclarationOrThrow().getType());
				if (javaType.startsWith("List<")) needsList = true;
				return `    ${javaType} ${p.getName()}`;
			});

			const lines = [
				`package ${javaPackage};`,
				...(needsList ? [`import java.util.List;`, ``] : [``]),
				`public record ${name}(`,
				fields.join(",\n"),
				`) {}`,
			];

			fs.writeFileSync(`${outputDir}/${name}.java`, lines.join("\n") + "\n");
		}
	}
	console.log('----------- </Types> -----------');
}
