# Information for Developers

currently this is WIP. More notes written down than real documentation

## Internal architecture notes

### Generate TS from Java (VM types)

> History: an earlier version generated Java *from* TS (`javagen/generate-java-from-hono.ts`).
> That direction was reversed — Java is now the source of truth and the
> `cz.habarta.typescript-generator` Maven plugin generates the TS. The `javagen/` folder is gone.

- View-model types (`PersonPageModel`, `PersonTableModel`, `PersonDetailModel`, ...) are hand-written
  Java records/classes under `src/main/java/org/svenehrke/demo/inbound/web/`, and are the single
  source of truth.
  - Controllers create these Java records, serialize them to JSON and pass them via GraalVM to JS.\
    Passing VMs via JSON is much more efficient and easier than passing Java objects: easy to produce
    in Java, easy and cheap to deserialize in JS.
- The `cz.habarta.typescript-generator` Maven plugin (bound to `process-classes` in `pom.xml`) scans
  `org.svenehrke.demo.inbound.**.*Model` / `*VM` and also the enums `JTSPersonRouteName` and
  `JTSPersonEventName`, and generates matching TS interfaces + union types into\
  `src/main/java/org/svenehrke/demo/inbound/web/generated/types/vm-types.d.ts`
  (gitignored — regenerated on every build that reaches `process-classes`, e.g. `mvn package`).
- `.ts` components import the generated types directly, e.g.\
  `import {PersonDetailModel} from "./generated/types/vm-types";` and, via `jtsperson.ts`'s
  `eventName()` guard, `JTSPersonEventName`.
  - TODO: rename `...Model` as `...VM`.
- typescript-generator only emits *types*. The two mutation endpoint path templates
  (`HonoWebApiSharedConsts.java`: `PERSON = "/person/{id}"`, `DELETE = "/delete"`) are needed as
  runtime string values on the TS side, so a small **inline Groovy script in `pom.xml`**
  (`gmavenplus-plugin`, also bound to `process-classes`) reflects over
  `HonoWebApiSharedConsts.HonoWebApiConsts` and writes\
  `generated/types/web-api-consts.ts` (`export const HonoWebApiConsts = { … } as const`), which
  `routes.ts` imports for `personActionUrls`. Same Java constants are used in
  `PersonActionController`'s `@PutMapping` / `@DeleteMapping` (compile-time constants), so nothing is
  hand-synced. Needs `gmavenplus` 5.1.0 + `org.apache.groovy:groovy` 5.1.1 (older Groovy can't parse
  JDK 25 class files).

### Generate JS for GraalVM (hono/html templates)

- The `.ts` components render HTML with hono's `html` tagged-template function
  (`import {html} from "hono/html"`), not with JSX. Each component is a plain function
  `(vm: SomeModel): HtmlResult => html`...`` where `HtmlResult = ReturnType<typeof html>`
  (see `route-types.ts`). These files used to be `.tsx` (JSX) — since the conversion they contain
  no JSX and are plain `.ts`; `tsconfig.json` no longer sets `jsx` / `jsxImportSource`.
- started by invoking `npm run build`...
- ... which runs:\
`npx esbuild src/main/java/org/svenehrke/demo/inbound/web/render.ts --bundle --platform=neutral --format=cjs --outfile=target/classes/static/fe/ssr.js`
- This means a single JS file (`ssr.js`) is generated from the `.ts` files to be used from Java via GraalVM.
- `render.ts` exports a single `render(route, vmJson)` entry function. It doesn't dispatch itself —
  it looks `route` up in `routes.ts`'s `personRoutes` map and calls that entry's `render(vm)`:
````JS
import {html} from 'hono/html';
import {personRoutes} from "./routes";
import {RouteDefinition} from "./route-types";

export function render(route: string, vmJson: string): string {
  const routeDefinitions: Record<string, RouteDefinition> = { ...personRoutes };
  const routeDefinition = routeDefinitions[route];
  if (routeDefinition) {
    const vm = JSON.parse(vmJson);
    return String(routeDefinition.render(vm));
  } else {
    return String(html`<div>ROUTE '${route}' NOT FOUND</div>`);
  }
}
````
````Java
@GetMapping("/uiroute/{name}")
public String uiroute(@PathVariable String name, @RequestParam(required = false) Long id) {
  var vm = /* build the *Model for this route */;
  return renderer.render(name, vm);
}
````
- **Why the `String(...)` at the boundary matters:** the per-route `render` functions return
  `HtmlResult` (a boxed `HtmlEscapedString`, possibly a `Promise`), but `JsxRenderer.java` calls
  `result.asString()` on whatever this function returns, which only works on a primitive JS string.
  `render.ts`'s header comment has the full explanation (boxed-String unboxing, the union collapse,
  hono's stringify phase). Rule of thumb: `HtmlResult` everywhere inside the components, stringify
  exactly once in `render.ts`.
- Adding a new route means: add the `JTSPersonRouteName` value (Java enum, regenerated into
  `vm-types.d.ts`), wire it into `PersonUIController.java`, and add its entry to `personRoutes` in
  `routes.ts` (the `satisfies Record<JTSPersonRouteName, RouteDefinition>` makes a missing entry a
  type error).

#### `.tsx` -> `.ts` (done)

The web layer used JSX until the `hono/html` conversion; afterwards no file under
`src/main/java/org/svenehrke/demo/inbound/web/` contained JSX, so all of them were renamed `.tsx` ->
`.ts`. Changed at the same time: `package.json` `build` script (`render.ts`), `watch.ts` (now
filters `.endsWith(".ts")`, so it also rebuilds on `route-types.ts` edits, which it ignored
before), and `tsconfig.json` (dropped the now-dead `jsx` / `jsxImportSource` options).

### Live reload for the browser
During development the browser should automatically refresh when one of the .ts files is changed.

This is achieved by using a SSE connection (see `DevReloadSSE.java`) which will
be triggered by `JsBundleWatcher` whenever the `ssr.js` bundle changed.

`layout.ts` with `dev.js` then listens to these SSE events:
````js
new EventSource("/dev-reload")
  .addEventListener("reload", () => {
    console.log("Reload triggered");
    location.reload();
    }
  );
````

Note: `spring-boot-devtools` is still used for JVM-level restart-on-change (see
`application-dev.properties`), but its own browser livereload feature is disabled
(`spring.devtools.livereload.enabled=false`) since it is superseded by the SSE
mechanism above, which reloads precisely when `ssr.js` changes instead of on every
classpath change.
(the last one can also be replaced by dedicated browser extensions)

## 2026-07-26

generation Java -> TS (pom:xml)
- *Model.java,*VM.java -> vm-types.d.ts (interfaces)
- JTSPersonRouteName -> vm-types.d.ts (union type)
- JTSPersonEventName -> vm-types.d.ts (union type)

PersonUIController uses
- JTSPersonRouteName for dispatching to TS rendering
- *Model to create VMs for TS side

PersonActionController uses
- JTSPersonEventName to send HTTP-response events

TS-components use
- vm-types/*Model for VMs
- vm-types/JTSPersonEventName to send events inside the UI

TS-routing (routes.ts) uses
- vm-types/JTSPersonRouteName for route definitions
