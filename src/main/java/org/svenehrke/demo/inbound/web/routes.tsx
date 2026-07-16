import { renderToString } from 'hono/jsx/dom/server';
import {RouteDefinition} from "./route-types";
import {PersondetailsCard} from "./persondetailscard";

export const personRoutes = {
	PersondetailsCard: { // SPRING-HONO
		url: (id: number) => `/demo/oob/person/${id}/detailscard`, // SPRING-HONO
		render: (vmJson: string) => {
			const vm = JSON.parse(vmJson);
			return renderToString(<PersondetailsCard vm={vm}></PersondetailsCard>);
		}
	},
} satisfies Record<string, RouteDefinition>;
