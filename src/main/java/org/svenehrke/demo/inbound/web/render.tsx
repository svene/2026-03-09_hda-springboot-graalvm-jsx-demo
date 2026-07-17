import { renderToString } from 'hono/jsx/dom/server';
import {personRoutes} from "./routes";
import {RouteDefinition} from "./route-types";

export function render(route: string, vmJson: string): string {
	const routeDefinitions: Record<string, RouteDefinition> = {
		...personRoutes,
	};

	const routeDefinition = routeDefinitions[route];
	if (routeDefinition) {
		const vm = JSON.parse(vmJson);
		return routeDefinition.render(vm);
	} else {
		return renderToString(<div>{`ROUTE '${route}' NOT FOUND`}</div>)
	}

}
