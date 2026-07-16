import { renderToString } from 'hono/jsx/dom/server';
import {Page} from "./personpage";
import {PersonDetails} from "./persondetails";
import {PersonRow} from "./personrow";
import {PersonEditor} from "./personedit";
import {PersondetailsRow} from "./persondetailrow";
import {PersonTable} from "./persontable";
import {personRoutes} from "./routes";
import {RouteDefinition} from "./route-types";

export function render(route: string, vmJson: string): string {
	const routeDefinitions: Record<string, RouteDefinition> = {
		...personRoutes,
	};

	const routeDefinition = routeDefinitions[route];
	if (routeDefinition) {
		return routeDefinition.render(vmJson);
	}

	const vm = JSON.parse(vmJson);
	switch (route) {
		case 'page':
			return renderToString(<Page vm={vm} />)
		case 'personDetails':
			return renderToString(<PersonDetails vm={vm} />)
		case 'personRow':
			return renderToString(<PersonRow vm={vm}/>)
		case 'personEdit':
			return renderToString(<PersonEditor vm={vm}/>)
		case 'personDetailsRow':
			return renderToString(<PersondetailsRow vm={vm} />)
		case 'personTable':
			return renderToString(<PersonTable vm={vm} />)
		default:
			return renderToString(<div>{`ROUTE '${route}' NOT FOUND`}</div>)
	}
}
