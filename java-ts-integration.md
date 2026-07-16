# TypeScript ↔ Java Integration: Shared URLs and View Models

## The Problem

This application has two runtime contexts that both need to know about the same things:

- **Java (Spring)** — handles HTTP requests, maps URL patterns to controller methods, queries the database, builds view models as Java records, renders HTML by calling GraalVM
- **TypeScript/JSX (Hono)** — renders HTML using JSX components, generates links and HTMX action URLs in templates, deserializes view models from JSON

Without coordination, URL strings and data shapes are duplicated across both sides. A typo in one place, or a field added to a view model on one side but not the other, causes silent bugs that are hard to trace: a 404 from a mismatched URL, or a `undefined` field in a JSX template from a missing record property.

The solution is to make **TypeScript the single source of truth** and generate the Java side from it.

---

## What Is Shared

There are two categories of shared knowledge:

### 1. URLs (route constants)

Every HTMX action attribute (`hx-get`, `hx-put`, `hx-delete`) in a JSX template references a URL. The same URL must appear as a `@GetMapping`/`@PutMapping`/`@DeleteMapping` annotation in the Spring controller. If they differ, the request goes to the wrong endpoint or returns 404.

Parameterized URLs like `/person/{id}/details` are used in both contexts:
- In **TypeScript**: `{id}` is replaced with a concrete value via `route-builder.ts` to build the `hx-get` attribute value
- In **Java/Spring**: `{id}` is left as-is as a path variable template in `@GetMapping`, with Spring's `@PathVariable` binding extracting the value at runtime

### 2. View Models (VMs)

Each controller action builds a view model Java record, serializes it to JSON, and passes it across the GraalVM boundary to the JSX renderer. The JSX component on the other side deserializes that JSON and uses the fields.

If the Java record has a field `firstName` but the JSX template accesses `vm.first_name`, the render silently produces an empty value. Both sides must use exactly the same field names and types.

---

## The Single Source of Truth

### URLs: `hono-web-api-shared-consts.ts`

```typescript
// src/main/java/org/svenehrke/demo/inbound/web/hono-web-api-shared-consts.ts

const BASE = '';

export const HonoWebApiConsts = {
    PAGE:               `${BASE}/page`,
    PERSON_TABLE:       `${BASE}/persontable`,
    PERSON_DETAILS:     `${BASE}/person/{id}/details`,
    PERSON_DETAILS_ROW: `${BASE}/person/{id}/detailsrow`,
    PERSON_EDIT:        `${BASE}/person/{id}/edit`,
    PERSON:             `${BASE}/person/{id}`,
    PERSON_ROW:         `${BASE}/person/{id}/row`,
    PERSON_DETAILS_CARD:`${BASE}/person/{id}/detailscard`,
    DELETE:             `${BASE}/delete`,
};

export const EvtBackendEvents = {
    PERSON_UPDATED: 'person-updated',
};
```

The `BASE` constant is intentionally empty here but allows prefixing all routes at once (e.g. for a context path) by changing a single string.

The `{id}` placeholders follow Spring's path variable template syntax. This is intentional: the same string works as a Spring `@GetMapping` pattern without modification, and in TypeScript, the `route-builder.ts` replaces `{id}` with a concrete number to produce actual links.

### View Models: `vm/person-page-model-vm.ts`

```typescript
// src/main/java/org/svenehrke/demo/inbound/web/vm/person-page-model-vm.ts

export type PersonTableRowModel = {
    id: number,
    firstName: string,
    lastName: string,
    streetName: string,
}

export type PersonTableModel = {
    people: PersonTableRowModel[],
    total: number,
}

export type PersonPageModel = {
    table: PersonTableModel,
}

export type PersonDetailModel = {
    id: number,
    firstName: string,
    lastName: string,
    streetName: string,
    streetNo: string,
    zipCode: string,
    city: string,
    country: string,
    mailBox: string,
    phoneNumber: string,
    cellPhone: string,
}

export type PersonEditModel = {
    id: number,
    firstName: string,
    lastName: string,
    streetName: string,
}
```

These TypeScript `type` aliases define the shape of every view model. They are used directly in JSX components (e.g. `PersonDetailModel` in `persondetails.tsx`) and are also the input to the Java record generator.

---

## The Code Generators

The generators live in `javagen/` and are invoked via:

```sh
npm run genjava
# which runs: npx ts-node javagen/generate-java-from-hono.ts
```

`generate-java-from-hono.ts` is the entry point. It calls two generators with glob patterns that select the TypeScript source files:

```typescript
// javagen/generate-java-from-hono.ts

const javaPackage = `org.svenehrke.demo.inbound.web`;
const outPath = `target/generated-sources/tsjava/${javaPackage.split(".").join("/")}`;

genJavaRecordsFromHonoTypes({
    tsConfigPath: './tsconfig.json',
    inputGlob: 'src/main/java/**/*-vm.ts',   // matches *-vm.ts files
    outputDir: outPath,
    javaPackage: javaPackage,
});

generateSharedConsts({
    tsConfigPath: 'tsconfig.json',
    inputGlob: 'src/main/java/**/*shared-consts.ts',   // matches *shared-consts.ts files
    outputDir: outPath,
    javaPackage: javaPackage,
});
```

Both generators use `ts-morph`, a wrapper around the TypeScript compiler API that gives programmatic access to the parsed AST and type information.

### Generator 1: View Models → Java Records (`generate-java-records.ts`)

For each TypeScript `type` alias found in the matched files, the generator:

1. Reads all properties of the type via the TypeScript type checker
2. Maps TypeScript primitive types to Java types:
   - `string` → `String`
   - `number` → `int`
   - `boolean` → `boolean`
   - `T[]` → `List<T>` (and adds `import java.util.List;`)
   - Named type aliases → used by their name (relies on the referenced type also being generated)
3. Emits a Java `record` with each property as a record component

**Example:**

TypeScript input:
```typescript
export type PersonTableRowModel = {
    id: number,
    firstName: string,
    lastName: string,
    streetName: string,
}
```

Generated Java output (`PersonTableRowModel.java`):
```java
package org.svenehrke.demo.inbound.web;

public record PersonTableRowModel(
    int id,
    String firstName,
    String lastName,
    String streetName
) {}
```

For nested/composite types, the generator references generated sibling records by name:

TypeScript:
```typescript
export type PersonTableModel = {
    people: PersonTableRowModel[],
    total: number,
}
```

Generated Java:
```java
package org.svenehrke.demo.inbound.web;
import java.util.List;

public record PersonTableModel(
    List<PersonTableRowModel> people,
    int total
) {}
```

### Generator 2: Shared Constants → Java Interfaces (`generate-shared-consts.ts`)

For each `*shared-consts.ts` file, the generator:

1. Derives the Java interface name from the filename by converting kebab-case to PascalCase:  
   `hono-web-api-shared-consts.ts` → `HonoWebApiSharedConsts`
2. Emits top-level `const` string declarations as `String` fields on the outer interface
3. Emits each exported `const` object literal as a nested `interface` inside the outer interface
4. Translates TypeScript template literals to Java string concatenation:  
   `` `${BASE}/person/{id}/details` `` → `BASE + "/person/{id}/details"`

**Example:**

TypeScript input:
```typescript
const BASE = '';

export const HonoWebApiConsts = {
    PAGE:           `${BASE}/page`,
    PERSON_DETAILS: `${BASE}/person/{id}/details`,
    // ...
};

export const EvtBackendEvents = {
    PERSON_UPDATED: 'person-updated',
};
```

Generated Java output (`HonoWebApiSharedConsts.java`):
```java
package org.svenehrke.demo.inbound.web;

public interface HonoWebApiSharedConsts {

    String BASE = "";

    interface HonoWebApiConsts {

        String PAGE = BASE + "/page";
        String PERSON_DETAILS = BASE + "/person/{id}/details";
        // ...
    }

    interface EvtBackendEvents {

        String PERSON_UPDATED = "person-updated";
    }

}
```

---

## How the Generated Code Is Used

### In Spring Controllers

The controller imports the generated constants and uses them directly as mapping annotations and response header values:

```java
// PagesController.java

@GetMapping(HonoWebApiConsts.PERSON_DETAILS)          // "/person/{id}/details"
public String details(@PathVariable int id) {
    PersonDetailModel vm = peopleService.personDetailModel(id);
    return renderer.render("personDetails", vm);
}

@PutMapping(HonoWebApiConsts.PERSON)                  // "/person/{id}"
public void updatePerson(@PathVariable int id, PersonEditModel body, HttpServletResponse response) {
    peopleService.updatePerson(id, body);
    response.setHeader(HTMXConsts.HX_TRIGGER, """
        {"%s": {"id": %d}}
        """.formatted(EvtBackendEvents.PERSON_UPDATED, id));
}
```

The generated records are used directly as method parameter types and return types of service methods:

```java
PersonDetailModel vm = peopleService.personDetailModel(id);   // generated record
PersonEditModel body                                           // generated record, bound from form POST
```

The redirect on `MainController` also uses the generated constant:

```java
return "redirect:" + HonoWebApiSharedConsts.HonoWebApiConsts.PAGE;   // "/page"
```

### In TypeScript Templates

The constants are imported from the source file directly (no generation needed on the TS side — it is the source):

**`route-builder.ts`** — URL builder for JSX templates:
```typescript
import {HonoWebApiConsts} from "./hono-web-api-shared-consts";

const idUrl = (url: string, id: number) => url.replace('{id}', id + '');

export const detailsUrl     = (id: number) => idUrl(HonoWebApiConsts.PERSON_DETAILS, id);
export const editUrl        = (id: number) => idUrl(HonoWebApiConsts.PERSON_EDIT, id);
export const detailsCardUrl = (id: number) => idUrl(HonoWebApiConsts.PERSON_DETAILS_CARD, id);
export const updateUrl      = (id: number) => idUrl(HonoWebApiConsts.PERSON, id);
export const rowUrl         = (id: number) => idUrl(HonoWebApiConsts.PERSON_ROW, id);
```

The JSX templates then use these builder functions to generate the HTMX attributes:

```tsx
// personrow.tsx
<tr hx-get={detailsUrl(vm.id)} hx-target="this" hx-swap="outerHTML">
```

This produces `hx-get="/person/5/details"` at render time — matching exactly the `@GetMapping(HonoWebApiConsts.PERSON_DETAILS)` pattern in the controller.

The view model types are imported into JSX components as TypeScript types:

```tsx
// persondetails.tsx
import type {PersonDetailModel} from "./vm/person-page-model-vm";

export function PersonDetails({vm}: {vm: PersonDetailModel}) {
    return <div>{vm.firstName} {vm.lastName}</div>;
}
```

---

## Data Flow Summary

```
hono-web-api-shared-consts.ts          (source of truth: URLs + event names)
vm/person-page-model-vm.ts             (source of truth: view model shapes)
        │
        │  npm run genjava
        │  (ts-morph reads TS AST)
        ▼
target/generated-sources/tsjava/
├── HonoWebApiSharedConsts.java        (interface with nested interfaces + String constants)
├── PersonPageModel.java               (record)
├── PersonTableModel.java              (record, List<PersonTableRowModel>)
├── PersonTableRowModel.java           (record)
├── PersonDetailModel.java             (record)
└── PersonEditModel.java               (record)
        │
        ▼
PagesController.java
  @GetMapping(HonoWebApiConsts.PERSON_DETAILS)    ← generated constant
  PersonDetailModel vm = service.personDetailModel(id)  ← generated record
  renderer.render("personDetails", vm)
        │
        │  JSON serialization (Jackson)
        ▼
GraalVM Context
  render("personDetails", jsonString)
        │
        │  JSON.parse(jsonString)
        ▼
persondetails.tsx
  import type {PersonDetailModel} from "./vm/person-page-model-vm"  ← same TS source
  function PersonDetails({vm}: {vm: PersonDetailModel}) { ... }
```

The URL constants flow in the opposite direction for link generation:

```
hono-web-api-shared-consts.ts
  HonoWebApiConsts.PERSON_DETAILS = "/person/{id}/details"
        │
        ├──► route-builder.ts  detailsUrl(id) = "/person/5/details"
        │         │
        │         ▼
        │    personrow.tsx  hx-get={detailsUrl(vm.id)}
        │
        └──► HonoWebApiSharedConsts.java (generated)
                  │
                  ▼
             PagesController.java  @GetMapping(HonoWebApiConsts.PERSON_DETAILS)
```

The link produced by the JSX template and the endpoint registered by the controller are guaranteed to match because both derive from the same constant definition.

---

## Build Integration

Generated files land in `target/generated-sources/tsjava/`. Maven is configured to include this directory as a source root, so the generated `.java` files are compiled together with hand-written Java on every `mvn compile`.

The generation step itself is not wired into the Maven lifecycle — it is run manually with `npm run genjava` when the TypeScript source-of-truth files change. In practice this is infrequent: view model shapes and URL patterns are stable once the feature is designed.

For local development, the flow is:

1. Edit `*-vm.ts` or `*shared-consts.ts`
2. Run `npm run genjava`
3. Run `mvn compile` (or let IDE incremental compilation pick it up)
4. Update JSX components if field names changed
