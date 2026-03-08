import {genJavaRecordsFromHonoTypes} from "./generate-java-records";
import {generateSharedConsts} from "./generate-shared-consts";

const javaPackage = `org.svenehrke.demo.inbound.web`;
const outPath = `target/generated-sources/tsjava/${javaPackage.split(".").join("/")}`;

genJavaRecordsFromHonoTypes({
	tsConfigPath: './tsconfig.json',
	inputGlob: 'src/main/java/**/*-vm.ts',
	outputDir: outPath,
	javaPackage: javaPackage,
});

generateSharedConsts({
	tsConfigPath: 'tsconfig.json',
	inputGlob: 'src/main/java/**/*shared-consts.ts',
	outputDir: outPath,
	javaPackage: javaPackage,
});


