import {PersonEditModel} from "./vm/person-page-model-vm";
import {detailsCardUrl, updateUrl} from "./route-builder";
import {EvtBackendEvents} from "./hono-web-api-shared-consts";

export const EvtPersonEditor = ({ vm }: {vm: PersonEditModel}) => (
	<tr id={`row-${vm.id}-edit`}>
		<template
			hx-trigger={`
			${EditEvents.CLOSE_REQUESTED}[event.detail.id == ${vm.id}] from:closest tr
			`}
			hx-target="closest tr"
			hx-swap="outerHTML"
			hx-get={detailsCardUrl(vm.id)}
		></template>
		<template
			hx-trigger={`
			${EvtBackendEvents.PERSON_UPDATED}[event.detail.id === ${vm.id}] from:closest tr
			`}
			hx-target="closest tr"
			hx-swap="outerHTML"
			hx-get={detailsCardUrl(vm.id)}
		></template>
		<td colSpan={4} style="padding: 0px">
			<div class="card p-5 my-2">
				<form>
					<div class="fixed-grid">
						<div class="grid">
							<div class="cell">
								<div class="field">
									<label class="label">Firstname</label>
									<div class="control">
										<input class="input" type="text" name="firstName" value={vm.firstName}></input>
									</div>
								</div>
							</div>
							<div class="cell">
								<div class="field">
									<label class="label">Lastname</label>
									<div class="control">
										<input class="input" type="text" name="lastName" value={vm.lastName}></input>
									</div>
								</div>
							</div>
							<div class="cell">
								<div class="field">
									<label class="label">Street</label>
									<div class="control">
										<input class="input" type="text" name="streetName" value={vm.streetName}></input>
									</div>
								</div>
							</div>
						</div>
					</div>
					<nav class="level">
						<button
							class="level-item button"
							_={`on click halt the event then send '${EditEvents.CLOSE_REQUESTED}'(id:${vm.id})`}
						>&lt; Back
						</button>
						<button
							type="submit"
							class="level-item button is-primary"
							hx-trigger="click consume"
							hx-put={updateUrl(vm.id)} /* Expects backend to respond with 'person-updated'(id) event */
							hx-swap="none" /* Works with event handling of 'person-updated' */
						>Save
						</button>
					</nav>
				</form>
			</div>
		</td>
	</tr>
);

const EditEvents = {
	CLOSE_REQUESTED: 'close-edit-requested',
};
