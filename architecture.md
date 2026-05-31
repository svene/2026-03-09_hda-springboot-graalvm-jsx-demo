# Architecture: Spring Boot + GraalVM + Hono/JSX HDA Demo

## Overview

This is a **Hypermedia-Driven Application (HDA)** that combines:

- **Spring Boot** (Java backend, REST controllers, JDBC persistence)
- **Hono/JSX** (TypeScript/TSX components compiled to a JS bundle)
- **GraalVM Polyglot** (executes the JS bundle inside the JVM at request time)
- **HTMX + Hyperscript** (browser-side partial page updates, no SPA framework)

The key idea: HTML is rendered server-side using JSX components (via Hono's `renderToString`), executed inside GraalVM. The browser receives HTML fragments and swaps them in using HTMX — no client-side rendering, no virtual DOM in the browser.

---

## Project Structure

```
project-root/
├── pom.xml                          # Maven: Spring Boot 4.0.3, GraalVM polyglot 25.0.2
├── package.json                     # Node/Bun: esbuild, hono, ts-morph
├── tsconfig.json                    # jsx="react-jsx", jsxImportSource="hono/jsx"
├── watch.ts                         # Bun watcher: rebuilds ssr.js on .tsx changes
├── javagen/                         # Code generators: TypeScript → Java
│   ├── generate-java-from-hono.ts
│   ├── generate-java-records.ts
│   └── generate-shared-consts.ts
├── src/main/java/.../
│   ├── app/                         # Config + runtime environment detection
│   ├── core/                        # Domain: Person, PeopleService, PeopleRepository
│   ├── inbound/web/                 # Controllers, JSX/TSX sources, RouteBuilder
│   │   ├── *.tsx / *.ts             # JSX components and shared type/const definitions
│   │   └── infra/js/                # GraalVM integration layer
│   └── outbound/db/                 # HSQLDB + Flyway + Datafaker seed
├── src/main/resources/
│   ├── application.properties       # app.ssr.resource=classpath:/static/fe/ssr.js
│   └── static/                      # HTMX, Alpine.js, Bulma CSS
└── target/
    ├── classes/static/fe/ssr.js     # Compiled SSR bundle (esbuild output)
    └── generated-sources/tsjava/   # Java records/interfaces generated from TypeScript
```

---

## The Core Rendering Pipeline

A complete request flows through these layers:

```
Browser GET /page
  → PagesController.page()
      → PeopleService.personTableModel()         [SQL query → Java record]
      → new PersonPageModel(tableModel)          [assemble view model]
      → JsxRenderer.render("page", vm)
          → jsonMapper.writeValueAsString(vm)    [serialize VM to JSON]
          → borrow JsConnection from pool        [acquire GraalVM context]
          → ctx.getEntryFunction("render")
            .execute("page", vmJson)             [cross-language call into JS]
              → render.tsx: JSON.parse(vmJson)   [deserialize in JS]
              → renderToString(<Page vm={vm}/>)  [Hono JSX → HTML string]
          → result.asString()                    [extract string from GraalVM Value]
          → pool.release(ctx)                    [return context to pool]
      → return HTML string                       [Spring writes to HTTP response]
```

**JSON is the only contract between Java and JS.** Java view models are serialized to JSON strings, passed across the GraalVM boundary as plain strings, and `JSON.parse()`'d in TypeScript. No GraalVM Value proxying or Java↔JS object bridging is used.

---

## GraalVM Integration Layer

The GraalVM integration lives in `src/main/java/.../inbound/web/infra/js/`.

### `JsHolder.java`
Owns the shared GraalVM `Engine` (created once at startup). All `Context` instances share this engine, which allows GraalVM to JIT-compile hot JS code across contexts. Loads `ssr.js` as a GraalVM `Source` and manages the `SimplePool<JsConnection>`. On hot-reload, `initPool()` discards and rebuilds the pool.

### `JsConnection.java`
Each pool slot wraps one GraalVM `Context`. On construction it:
1. Injects a `TextEncoder` polyfill (required by Hono's JSX runtime, not provided by GraalVM by default)
2. Injects `var module = {exports:{}}; var exports = module.exports;` for CommonJS compatibility
3. Evaluates the entire `ssr.js` bundle
4. Scans `module.exports` for callable functions and caches them in a `Map<String, Value>`

Each `JsConnection` is a fully initialized, isolated JS execution environment ready to be borrowed concurrently.

### `SimplePool.java`
A `BlockingQueue`-based pool sized to `Runtime.getRuntime().availableProcessors()`. `borrow()` blocks until a slot is available. This is necessary because GraalVM Contexts are not thread-safe.

### `JsxRenderer.java`
The Spring `@Service` that ties the above together. Serializes the view model to JSON, borrows a pool slot, calls the JS `render` function, extracts the HTML string, and releases the slot.

---

## JSX/TypeScript Layer

All `.tsx` and `.ts` files live alongside Java sources in `src/main/java/.../inbound/web/`. They are compiled by esbuild into a single `ssr.js` bundle.

### Entry point: `render.tsx`
```tsx
export function render(route: string, vmJson: string): string {
    const vm = JSON.parse(vmJson);
    switch (route) {
        case 'page':          return renderToString(<Page vm={vm} />)
        case 'personDetails': return renderToString(<PersonDetails vm={vm} />)
        // ... all routes
    }
}
```
The `route` string maps to a JSX component. `renderToString` from `hono/jsx/dom/server` produces the HTML synchronously.

### JSX Component Files

| File | Renders |
|------|---------|
| `layout.tsx` | Root HTML shell (`<html>`, `<head>`, Alpine/HTMX/Hyperscript scripts) |
| `personpage.tsx` | Full page: search input + person table |
| `persontable.tsx` | `<div id="result-table">`: table with bulk-delete form |
| `personrow.tsx` | Single `<tr>` with HTMX expand-on-click |
| `persondetails.tsx` | Composite: header row + details card |
| `persondetailrow.tsx` | Expanded header row with Hyperscript collapse logic |
| `persondetailscard.tsx` | Details card; click leads to edit form |
| `personedit.tsx` | Edit form row with HTMX PUT + Hyperscript cancel |

### Shared Type and Constant Files

| File | Role |
|------|------|
| `hono-web-api-shared-consts.ts` | Single source of truth for all URL patterns and event names |
| `route-builder.ts` | URL helpers for JSX templates (mirrors `RouteBuilder.java`) |
| `vm/person-page-model-vm.ts` | View model types: `PersonPageModel`, `PersonTableModel`, etc. |

---

## The TypeScript → Java Code Generation Bridge

The most distinctive architectural pattern: **TypeScript is the source of truth for shared types and constants; Java code is generated from it.**

### `javagen/generate-java-records.ts`
Uses `ts-morph` (TypeScript compiler API) to parse TypeScript type aliases and emit Java records. For example:
```ts
type PersonTableRowModel = { id: number, firstName: string, selected: boolean }
```
becomes:
```java
public record PersonTableRowModel(int id, String firstName, boolean selected) {}
```

### `javagen/generate-shared-consts.ts`
Parses TypeScript `const` object literals and emits Java interfaces with `String` constants. Template literals like `` `${BASE}/person/${ID}` `` are translated to Java string concatenation.

Generated files land in `target/generated-sources/tsjava/` — a Maven source root automatically compiled alongside hand-written Java. Running `npm run genjava` regenerates them.

---

## HTMX Interaction Choreography

UI interactions use a combination of HTMX (server round-trips) and Hyperscript (client-side events):

- **`hx-get`/`hx-put`/`hx-delete`** on elements trigger partial HTML swaps
- **Hyperscript `_` attributes** handle client-side DOM events without JS files
- **`<template hx-trigger>`** elements are invisible HTMX triggers embedded in rows, listening for custom events

**Example — saving an edit:**
1. Save button fires HTMX `PUT /person/{id}` with `hx-swap="none"`
2. Java controller sets response header `HX-Trigger: {"person-updated": {"id": 5}}`
3. HTMX dispatches a `person-updated` DOM event with `{id: 5}`
4. A `<template>` inside the matching row listens for this event and fires `hx-get` to re-fetch the updated row

`HTMXConsts.java` holds the response header name constants used in the controllers.

---

## Dev Hot-Reload Pipeline

In dev mode (`spring.profiles.active=dev`), changes to `.tsx` files propagate to the browser without a JVM restart:

1. **`watch.ts`** (Bun) monitors `src/main/java/**/*.tsx` → runs esbuild → updates `target/classes/static/fe/ssr.js`
2. **`JsBundleWatcher.java`** (`@Scheduled`, 500ms) polls `ssr.js` for `lastModified` changes → calls `jsHolder.initPool()` → rebuilds the GraalVM context pool with the new bundle
3. **Spring DevTools LiveReload** notifies the browser → page refreshes

`application-dev.properties` excludes `static/fe/**` from the DevTools restart trigger, so only the JS pool is replaced — not the JVM. Hot-reload is fast.

---

## Build

### Java build (`pom.xml`)
```xml
<dependency>
    <groupId>org.graalvm.polyglot</groupId>
    <artifactId>polyglot</artifactId>
    <version>25.0.2</version>
</dependency>
<dependency>
    <groupId>org.graalvm.polyglot</groupId>
    <artifactId>js</artifactId>
    <version>25.0.2</version>
    <type>pom</type>
</dependency>
```
GraalVM runs as a regular JVM library — no native GraalVM JDK required.

### JS build (`package.json`)
```sh
esbuild src/main/java/.../render.tsx \
  --bundle --platform=neutral --format=cjs \
  --outfile=target/classes/static/fe/ssr.js
```
`--platform=neutral` avoids injecting Node.js or browser globals. `--format=cjs` produces a CommonJS bundle compatible with GraalVM's `module.exports` emulation.

---

## Persistence

- **HSQLDB** (embedded, in-memory) with **Flyway** migrations (`V1__create_person_table.sql`)
- **Spring `JdbcClient`** (fluent SQL API) in `HSQLPeopleRepository.java` — returns typed Java records directly
- **`DBInitializer.java`** seeds 150 fake persons using `net.datafaker.Faker` with `seed=0` for reproducible data (the Playwright E2E tests depend on "Jackie Rau" always being the first person)

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| JSX for server-side templates | Type-safe, composable, familiar to frontend devs; avoids Thymeleaf/Freemarker |
| JSON string as Java↔JS contract | Simple, no GraalVM Value proxying, easy to debug |
| Blocking pool of GraalVM Contexts | Contexts are not thread-safe; pool prevents contention |
| TypeScript as source of truth for types | Eliminates manual sync between TS view models and Java records |
| TSX files co-located with Java controllers | Templates are part of the web layer, not a separate frontend project |
| No native image compilation | Keeps build simple; GraalVM polyglot works on standard JDK |
