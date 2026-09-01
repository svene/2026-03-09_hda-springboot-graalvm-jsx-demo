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

### Generate JS for GraalVM (hono/html templates)

- The `.tsx` components render HTML with hono's `html` tagged-template function
  (`import {html} from "hono/html"`), not with JSX. Each component is a plain function
  `(vm: SomeModel): HtmlResult => html`...`` where `HtmlResult = ReturnType<typeof html>`
  (see `route-types.ts`). The files keep the `.tsx` extension for now even though none of
  them contain JSX any more — see "Possible cleanup: `.tsx` -> `.ts`" below.
- started by invoking `npm run build`...
- ... which runs:\
`npx esbuild src/main/java/org/svenehrke/demo/inbound/web/render.tsx --bundle --platform=neutral --format=cjs --outfile=target/classes/static/fe/ssr.js`
- This means a single JS file (`ssr.js`) is generated from the `.tsx`/`.ts` files to be used from Java via GraalVM.
- `render.tsx` exports a single `render(route, vmJson)` entry function. It doesn't dispatch itself —
  it looks `route` up in `routes.tsx`'s `personRoutes` map and calls that entry's `render(vm)`:
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
  `render.tsx`'s header comment has the full explanation (boxed-String unboxing, the union collapse,
  hono's stringify phase). Rule of thumb: `HtmlResult` everywhere inside the components, stringify
  exactly once in `render.tsx`.
- Adding a new route means: add the `JTSPersonRouteName` value (Java enum, regenerated into
  `vm-types.d.ts`), wire it into `PersonUIController.java`, and add its entry to `personRoutes` in
  `routes.tsx` (the `satisfies Record<JTSPersonRouteName, RouteDefinition>` makes a missing entry a
  type error).

#### Possible cleanup: `.tsx` -> `.ts` (later)

Since the move from JSX to `hono/html` tagged templates, **no file under
`src/main/java/org/svenehrke/demo/inbound/web/` contains JSX any more**, so every `.tsx` there could
become `.ts`. It's a small, genuine complexity reduction: no more `jsx` / `jsxImportSource` in
`tsconfig.json`, and the file extension stops implying a JSX capability that isn't used. Not done yet
because it also touches:

- `package.json` `build` script (hardcodes `render.tsx`)
- `watch.ts` (filters on `filename.endsWith(".tsx")` — switching to `.ts` also makes it finally
  rebuild on `route-types.ts` edits, which it ignores today)
- `tsconfig.json` (drop the now-dead `jsx` options)
- ~11 file renames + the git-history churn

### Live reload for the browser
During development the browser should automatically refresh when one of the tsx files is changed.

This is achieved by using a SSE connection (see `DevReloadSSE.java`) which will
be triggered by `JsBundleWatcher` whenever the `ssr.js` bundle changed.

`layout.tsx` with `dev.js` then listens to these SSE events:
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

TS-routing (routes.tsx) uses
- vm-types/JTSPersonRouteName for route definitions
