import { Project } from "ts-morph";

export interface SharedConstGeneratorOptions {
	project: Project;
	inputGlob: string | string[];
	outputDir: string;
	javaPackage: string;
}
