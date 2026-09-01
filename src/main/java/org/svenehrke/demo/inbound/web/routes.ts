import {ActionUrlDefinition, RouteDefinition} from "./route-types";
import {PersonDetailsCard} from "./personDetailsCard";
import {Page} from "./personpage";
import {PersonDetails} from "./persondetails";
import {PersonRow} from "./personrow";
import {PersonEditor} from "./personedit";
import {PersonDetailsRow} from "./persondetailrow";
import {PersonTable} from "./persontable";
import {JTSPersonRouteName} from "./generated/types/vm-types";
import {HonoWebApiConsts} from "./generated/types/web-api-consts";

const nameIdUrl = (name: JTSPersonRouteName, id: number) => `/uiroute/${name}?id=${id}`; // Java-HONO
const nameUrl = (name: JTSPersonRouteName) => `/uiroute/${name}`; // Java-HONO

/**
 * `personRoutes` is the single source of truth for the component URLs dispatched
 * through `PersonUIController.java`'s `/uiroute/{name}` endpoint: both the URL a
 * component uses in `hx-get` / `hx-target` (e.g.
 * `hx-get="${personRoutes.PersonDetails.url(vm.id)}"` in `personrow.ts`) and the
 * render function that produces the HTML for it live together here.
 *
 * The route-name strings are checked against `JTSPersonRouteName`, a union the
 * `typescript-generator` Maven plugin generates from the Java
 * `JTSPersonRouteName` enum into `generated/types/vm-types.d.ts` — the Java enum
 * is the source of truth, and `satisfies PersonRoutesMap` below makes a missing
 * or misspelled entry a TS error.
 **/

type PersonRoutesMap = Record<JTSPersonRouteName, RouteDefinition>;
export const personRoutes = {
	Page: { // Java-HONO
		url: () => nameUrl('Page'), // Java-HONO
		render: (vm: any) => Page(vm)
	},
	PersonTable: { // Java-HONO
		url: () => nameUrl('PersonTable'), // Java-HONO
		render: (vm: any) => PersonTable(vm)
	},
	PersonDetails: { // Java-HONO
		url: (id: number) => nameIdUrl('PersonDetails', id), // Java-HONO
		render: (vm: any) => PersonDetails(vm)
	},
	PersonRow: { // Java-HONO
		url: (id: number) => nameIdUrl('PersonRow', id), // Java-HONO
		render: (vm: any) => PersonRow(vm)
	},
	PersonEditor: { // Java-HONO
		url: (id: number) => nameIdUrl('PersonEditor', id), // Java-HONO
		render: (vm: any) => PersonEditor(vm)
	},
	PersonDetailsCard: { // Java-HONO
		url: (id: number) => nameIdUrl('PersonDetailsCard', id), // Java-HONO
		render: (vm: any) => PersonDetailsCard(vm)
	},
	PersonDetailsRow: { // Java-HONO
		url: (id: number) => nameIdUrl('PersonDetailsRow', id), // Java-HONO
		render: (vm: any) => PersonDetailsRow(vm)
	},
} satisfies PersonRoutesMap;

// Mutation path templates come from generated/types/web-api-consts.ts, generated
// from HonoWebApiSharedConsts.java by the gmavenplus script in pom.xml (Java is
// the source of truth, also used in PersonActionController's @PutMapping /
// @DeleteMapping).
export const personActionUrls = {
	UpdatePerson: { // Java-HONO
		url: (id: number) => HonoWebApiConsts.PERSON.replace('{id}', id + ''),
	},
	Delete: { // Java-HONO
		url: () => HonoWebApiConsts.DELETE,
	},
} satisfies Record<string, ActionUrlDefinition>;
