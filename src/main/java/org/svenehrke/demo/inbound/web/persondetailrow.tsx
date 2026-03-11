import {PersonDetailModel} from "./vm/person-page-model-vm";
import {EvtBackendEvents} from "./hono-web-api-shared-consts";
import {detailsRowUrl, rowUrl} from "./route-builder";

export const PersondetailsRow = ({vm}: { vm: PersonDetailModel }) => (
		<>
			<tr
				id={`row-${vm.id}`}
				style="cursor: pointer"
				_={`on click halt the event then send '${EvtPersonDetailsRowX.CLOSE_REQUESTED}'(id:${vm.id})`}
			>
				<template
					hx-trigger={`${EvtPersonDetailsRowX.CLOSE_REQUESTED}[event.detail.id == ${vm.id}] from:closest tr`}
					hx-target="closest tr"
					hx-swap="outerHTML"
					hx-get={rowUrl(vm.id)}
				></template>
				<template
					hx-trigger={`${EvtBackendEvents.PERSON_UPDATED}[event.detail.id == ${vm.id}] from:body`}
					hx-target="closest tr"
					hx-swap="outerHTML"
					hx-get={detailsRowUrl(vm.id)}
				></template>
				<td style="border-style: none"></td>
				<td style="border-style: none">{vm.firstName}</td>
				<td style="border-style: none">{vm.lastName}</td>
				<td style="border-style: none">{vm.streetName}</td>
				<td style="border-style: none"><span class="icon"><i class="material-icons">arrow_drop_up</i></span></td>
			</tr>
		</>
);

export const EvtPersonDetailsRowX = {
	CLOSE_REQUESTED: 'close-details-requested',
}
