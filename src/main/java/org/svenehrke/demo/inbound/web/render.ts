import {html} from 'hono/html';
import {personRoutes} from "./routes";
import {RouteDefinition} from "./route-types";

/**
 * GraalVM entry point. `JsxRenderer.java` looks this function up in
 * `module.exports`, calls it with the route name + the VM as a JSON string, and
 * then does `result.asString()` on the returned polyglot Value.
 *
 * It MUST return a primitive `string`, not the `HtmlResult` that the individual
 * route `render` functions produce:
 *
 *  - `html`...`` returns an `HtmlEscapedString`, i.e. a boxed `new String(...)`
 *    object. GraalVM's `Value.isString()` is false for a boxed String wrapper,
 *    so `result.asString()` on the Java side would throw. `String(...)` here
 *    converts it to the primitive string `asString()` expects.
 *  - `HtmlResult` is `HtmlEscapedString | Promise<HtmlEscapedString>`. Wrapping
 *    in `String(...)` collapses that union at the boundary; a Promise would
 *    otherwise cross into Java unresolved.
 *  - `String()` / `.toString()` also runs hono's stringify phase, which resolves
 *    any deferred escaping callbacks. Handing Java the raw object skips it.
 *
 * So: `HtmlResult` everywhere inside the .ts components, stringify exactly once
 * right here at the Java call site.
 */
export function render(route: string, vmJson: string): string {
	const routeDefinitions: Record<string, RouteDefinition> = personRoutes;

	const routeDefinition = routeDefinitions[route];
	if (routeDefinition) {
		const vm = JSON.parse(vmJson);
		return String(routeDefinition.render(vm));
	} else {
		return String(html`<div>ROUTE '${route}' NOT FOUND</div>`);
	}
}
