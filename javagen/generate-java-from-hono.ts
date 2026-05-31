import { Project } from "ts-morph";
import { genJavaRecordsFromHonoTypes } from "./generate-java-records";
import { generateSharedConsts } from "./generate-shared-consts";

const javaPackage = `org.svenehrke.demo.inbound.web`;
const outputDir = `target/generated-sources/tsjava/${javaPackage.replaceAll(".", "/")}`;
const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const options = { project, outputDir, javaPackage };

genJavaRecordsFromHonoTypes({ ...options, inputGlob: 'src/main/java/**/*-vm.ts' });
await generateSharedConsts({ ...options, inputGlob: 'src/main/java/**/*shared-consts.ts' });
