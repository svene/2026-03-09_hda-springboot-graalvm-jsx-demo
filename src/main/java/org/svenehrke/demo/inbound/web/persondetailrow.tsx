import {html} from "hono/html";
import {personRoutes} from "./routes";
import {PersonDetailModel} from "./generated/types/vm-types";
import {eventName} from "./jtsperson";
import {HtmlResult} from "./route-types";

export const PersonDetailsRow = (vm: PersonDetailModel): HtmlResult => html`
	<tr
		id="row-${vm.id}"
		style="cursor: pointer"
		_="on click halt the event then send ${eventName('PersonDetailsRow_CloseCmd')}(id:${vm.id})"
	>
		<template
			hx-trigger="${eventName('PersonDetailsRow_CloseCmd')}[detail.id == ${vm.id}] from:'closest tr'"
			hx-target="closest tr"
			hx-swap="outerHTML"
			hx-get="${personRoutes.PersonRow.url(vm.id)}"
		></template>
		<template
			hx-trigger="${eventName('PERSON_UPDATED')}[detail.id == ${vm.id}] from:body"
			hx-target="closest tr"
			hx-swap="outerHTML"
			hx-get="${personRoutes.PersonDetailsRow.url(vm.id)}"
		></template>
		<td style="border-style: none"></td>
		<td style="border-style: none">${vm.firstName}</td>
		<td style="border-style: none">${vm.lastName}</td>
		<td style="border-style: none">${vm.streetName}</td>
		<td style="border-style: none"><span class="icon"><i class="material-icons">arrow_drop_up</i></span></td>
	</tr>
`;
