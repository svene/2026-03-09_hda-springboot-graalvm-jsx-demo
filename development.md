# Information for Developers

currently this is WIP. More notes written down than real documentation

## Internal architecture notes

### Generate Java from TS

- `javagen/generate-java-from-hono.ts` generates Java code for the TS-VMs.
 - This way the controllers can create Java-VMs, serialize them to JSON and pass them via GraalVM to JS.\
  - Passing VMs via JSON is much more efficient and easier compared to passing Java-Objects:\
it is easy to do so in Java, deserializing them in JS is easy as well and much more efficient.
  - Concretely from `src/main/java/org/svenehrke/demo/inbound/web/hono-web-api-shared-consts.ts` Java VM classes like `PersonPageModel`, `PersonTableModel`, ... will be created.
  - TODO: rename `...Model` as `...VM`. 
  - They will be generated into\
  `target/generated-sources/tsjava/org/svenehrke/demo/inbound/web`

### Generate JS from JSX for GraalVM

- started by invoking `npm run build`...
- ... which runs:\
`npx esbuild src/main/java/org/svenehrke/demo/inbound/web/render.tsx --bundle --platform=neutral --format=cjs --outfile=target/classes/static/fe/ssr.js`
- This means a single JS file (`ssr.js`) is generated from the JSX/TS files to be used from Java via GraalVM.
- `render.tsx` contains all the entry functions which can be called from Java.
- Example:
````JS 
import { renderToString } from 'hono/jsx/dom/server';
export function renderPage(vmJson: string): string {
  const vm = JSON.parse(vmJson);
  return renderToString(<Page vm={vm} />)
}
```` 

````Java 
@GetMapping(HonoWebApiConsts.PAGE)
public String page() {
  var vm = new PersonPageModel(peopleService.personTableModel());
  return renderer.render("renderPage", vm);
}
```` 
- `render.tsx` needs to provide all functions needed by the Spring-Controller to return HTML.
- Usually this means for each endpoint in the Controller there will be a
corresponding function in `render.tsx`

### Live reload for the browser
During development the browser should automatically refresh when one of the tsx files is changed.

This is achieved by using springs devtools:

````xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-devtools</artifactId>
  <scope>runtime</scope>
  <optional>true</optional>
</dependency>
````
... the following settings in `application-dev.properties`:
````properties
spring.devtools.restart.exclude=static/fe/**
spring.devtools.livereload.enabled=true
spring.devtools.restart.poll-interval=50
spring.devtools.restart.quiet-period=10
````

and the following script entry in `layout.tsx`:
````html
  <script src="http://localhost:35729/livereload.js"></script>
````
(the last one can also be replaced by dedicated browser extensions)

