# SpringBoot-GraalVM-JSX HDA Demo

Hypermedia driven Application using:

- GraalVM
- Spring Boot
- JSX (from Hono)

## Development

- run `bun install` (only once)
- run `bun javagen/generate-java-from-hono.ts` (only once)
- make sure `target/generated-sources/tsjava` is part of your IDE's source path (IntelliJ: Project Tree->right click 'Maven/Generate Sources and Update Folders') (only once)
- run `bun run watch`
- start Spring Boot App
- point browser to http://localhost:8080

Changes in tsx files will be immediately visible in browser.
