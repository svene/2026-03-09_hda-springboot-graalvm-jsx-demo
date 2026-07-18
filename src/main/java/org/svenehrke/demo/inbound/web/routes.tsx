import { renderToString } from 'hono/jsx/dom/server';
import {ActionUrlDefinition, RouteDefinition} from "./route-types";
import {PersondetailsCard} from "./persondetailscard";
import {Page} from "./personpage";
import {PersonDetails} from "./persondetails";
import {PersonRow} from "./personrow";
import {PersonEditor} from "./personedit";
import {PersondetailsRow} from "./persondetailrow";
import {PersonTable} from "./persontable";
import {JTSPersonEventName, JTSPersonRouteName} from "./generated/types/vm-types";

const nameIdUrl = (name: JTSPersonRouteName, id: number) => `/component/${name}?id=${id}`; // SPRING-HONO
const nameUrl = (name: JTSPersonRouteName) => `/component/${name}`; // SPRING-HONO

/**
 * TODO: verify this comment:
 * These constants have two main purposes:
 * 1. in the TSX templates for the HTML-links or htmx-actions:
 *    this is done indirectly via route-builder.ts.
 *    See `hx-get={detailsUrl(vm.id)}` in `personrow.tsx` as an example.
 *
 * 2. For the Controller-Endpoints in the Java-Spring part.
 *    See PersonComponentController.java on how they are used.
 *    Note that the Java-Constants used in the Controller are generated
 *    from the constants here in this file.
 *    The generator code is located in the folder `javagen`.
 **/

type PersonRoutesMap = { Page: RouteDefinition } & Record<JTSPersonRouteName, RouteDefinition>;
export const personRoutes = {
	Page: { // SPRING-HONO
		url: () => nameUrl('Page'), // SPRING-HONO
		render: (vm: any) => renderToString(<Page vm={vm}/>)
	},
	PersonTable: { // SPRING-HONO
		url: () => nameUrl('PersonTable'), // SPRING-HONO
		render: (vm: any) => renderToString(<PersonTable vm={vm}/>)
	},
	PersonDetails: { // SPRING-HONO
		url: (id: number) => nameIdUrl('PersonDetails', id), // SPRING-HONO
		render: (vm: any) => renderToString(<PersonDetails vm={vm}/>)
	},
	PersonRow: { // SPRING-HONO
		url: (id: number) => nameIdUrl('PersonRow', id), // SPRING-HONO
		render: (vm: any) => renderToString(<PersonRow vm={vm}/>)
	},
	PersonEditor: { // SPRING-HONO
		url: (id: number) => nameIdUrl('PersonEditor', id), // SPRING-HONO
		render: (vm: any) => renderToString(<PersonEditor vm={vm}/>)
	},
	PersondetailsCard: { // SPRING-HONO
		url: (id: number) => nameIdUrl('PersondetailsCard', id), // SPRING-HONO
		render: (vm: any) => renderToString(<PersondetailsCard vm={vm}/>)
	},
	PersondetailsRow: { // SPRING-HONO
		url: (id: number) => nameIdUrl('PersondetailsRow', id), // SPRING-HONO
		render: (vm: any) => renderToString(<PersondetailsRow vm={vm}/>)
	},
} satisfies PersonRoutesMap;

export const personActionUrls = {
	UpdatePerson: { // SPRING-HONO
		url: (id: number) => `/person/${id}`, // SPRING-HONO
	},
	Delete: { // SPRING-HONO
		url: () => `/delete`, // SPRING-HONO
	},
} satisfies Record<string, ActionUrlDefinition>;

/** SPRING-HONO: JTSPersonEventName.java
 * guard function to be used in tsx supporting code completion
 */
export const eventName = (name: JTSPersonEventName): JTSPersonEventName => {
	return name
}
