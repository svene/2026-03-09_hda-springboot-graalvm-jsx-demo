import { renderToString } from 'hono/jsx/dom/server';
import {personRoutes} from "./routes";
import {RouteDefinition} from "./route-types";

export function render(route: string, vmJson: string): string {
	const routeDefinitions: Record<string, RouteDefinition> = {
		...personRoutes,
	};

	const routeDefinition = routeDefinitions[route];
	if (routeDefinition) {
		return routeDefinition.render(vmJson);
	} else {
		return renderToString(<div>{`ROUTE '${route}' NOT FOUND`}</div>)
	}

}
