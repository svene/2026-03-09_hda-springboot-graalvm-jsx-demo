import {Project, SourceFile, Type} from "ts-morph";
import * as fs from "fs";
import {SharedConstGeneratorOptions} from "./generator-options";

function map(type: Type): string {
	if (type.isString()) return "String";
	if (type.isNumber()) return "int";
	if (type.isBoolean()) return "boolean";

	if (type.isArray()) {
		return `List<${map(type.getArrayElementTypeOrThrow())}>`;
	}

	const aliasSymbol = type.getAliasSymbol();
	if (aliasSymbol) {
		return aliasSymbol.getName();
	}
	const symbol = type.getSymbol();
	if (symbol) return symbol.getName();

	throw new Error(`Unsupported DTO type: ${type.getText()}`);
}

function genJavaRecordsFromHonoSourceFiles(sources: SourceFile[], javaPackage: string, outPath: string) {
	fs.mkdirSync(outPath, { recursive: true });

	console.log('----------- <Types> -----------')
	for (const source of sources) {
		for (const alias of source.getTypeAliases()) {
			const name = alias.getName();
			console.log(name);
			const fields = alias.getType().getProperties().map(p => {
				const t = p.getValueDeclarationOrThrow().getType();
				return `    ${map(t)} ${p.getName()}`;
			});

			const needsList = fields.some(f => f.includes("List<"));

			const java = `
package ${javaPackage};
${needsList ? "import java.util.List;\n" : "\n"}
public record ${name}(
${fields.join(",\n")}
) {}
`.trim();

			fs.writeFileSync(`${outPath}/${name}.java`, java + "\n");
		}
	}
	console.log('----------- </Types> -----------')
}

export function genJavaRecordsFromHonoTypes(options: SharedConstGeneratorOptions) {
	const {
		tsConfigPath,
		inputGlob,
		javaPackage,
		outputDir,
	} = options;

	const project = new Project({
		tsConfigFilePath: tsConfigPath,
	});
	const sources: SourceFile[] = project.addSourceFilesAtPaths(inputGlob);
	genJavaRecordsFromHonoSourceFiles(sources, javaPackage, outputDir);
}

