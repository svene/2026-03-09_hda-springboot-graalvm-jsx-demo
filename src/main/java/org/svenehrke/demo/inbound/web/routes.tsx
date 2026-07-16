import { renderToString } from 'hono/jsx/dom/server';
import {RouteDefinition} from "./route-types";
import {PersondetailsCard} from "./persondetailscard";
import {Page} from "./personpage";
import {PersonDetails} from "./persondetails";
import {PersonRow} from "./personrow";
import {PersonEditor} from "./personedit";
import {PersondetailsRow} from "./persondetailrow";
import {PersonTable} from "./persontable";

export const personRoutes = {
	Page: { // SPRING-HONO
		url: () => `/page`, // SPRING-HONO
		render: (vmJson: string) => {
			const vm = JSON.parse(vmJson);
			return renderToString(<Page vm={vm} />);
		}
	},
	PersonTable: { // SPRING-HONO
		url: () => `/persontable`, // SPRING-HONO
		render: (vmJson: string) => {
			const vm = JSON.parse(vmJson);
			return renderToString(<PersonTable vm={vm}/>);
		}
	},
	PersonDetails: { // SPRING-HONO
		url: (id: number) => `/person/${id}/details`, // SPRING-HONO
		render: (vmJson: string) => {
			const vm = JSON.parse(vmJson);
			return renderToString(<PersonDetails vm={vm} />);
		}
	},
	PersonRow: { // SPRING-HONO
		url: (id: number) => `/person/${id}/row`, // SPRING-HONO
		render: (vmJson: string) => {
			const vm = JSON.parse(vmJson);
			return renderToString(<PersonRow vm={vm}/>);
		}
	},
	PersonEditor: { // SPRING-HONO
		url: (id: number) => `/person/${id}/edit`, // SPRING-HONO
		render: (vmJson: string) => {
			const vm = JSON.parse(vmJson);
			return renderToString(<PersonEditor vm={vm}/>);
		}
	},
	PersondetailsCard: { // SPRING-HONO
		url: (id: number) => `/person/${id}/detailscard`, // SPRING-HONO
		render: (vmJson: string) => {
			const vm = JSON.parse(vmJson);
			return renderToString(<PersondetailsCard vm={vm}/>);
		}
	},
	PersondetailsRow: { // SPRING-HONO
		url: (id: number) => `/person/${id}/detailsrow`, // SPRING-HONO
		render: (vmJson: string) => {
			const vm = JSON.parse(vmJson);
			return renderToString(<PersondetailsRow vm={vm}/>);
		}
	},
} satisfies Record<string, RouteDefinition>;
