import {html} from "hono/html";
import {PersonEditModel} from "./generated/types/vm-types";
import {personActionUrls, personRoutes} from "./routes";
import {eventName} from "./jtsperson";
import {HtmlResult} from "./route-types";

// The Save button PUTs to UpdatePerson and expects the backend to answer with a
// 'PERSON_UPDATED'(id) event; hx-swap="none" leaves the DOM to the <template>
// event handlers above that listen for that event.
export const PersonEditor = (vm: PersonEditModel): HtmlResult => html`
	<tr id="row-${vm.id}-edit">
		<template
			hx-trigger="${eventName('PersonEditor_CloseRequested')}[detail.id == ${vm.id}] from:'closest tr'"
			hx-target="closest tr"
			hx-swap="outerHTML"
			hx-get="${personRoutes.PersonDetailsCard.url(vm.id)}"
		></template>
		<template
			hx-trigger="${eventName('PERSON_UPDATED')}[detail.id === ${vm.id}] from:'closest tr'"
			hx-target="closest tr"
			hx-swap="outerHTML"
			hx-get="${personRoutes.PersonDetailsCard.url(vm.id)}"
		></template>
		<td colspan="4" style="padding: 0px">
			<div class="card p-5 my-2">
				<form>
					<div class="fixed-grid">
						<div class="grid">
							<div class="cell">
								<div class="field">
									<label class="label">Firstname</label>
									<div class="control">
										<input class="input" type="text" name="firstName" value="${vm.firstName}"></input>
									</div>
								</div>
							</div>
							<div class="cell">
								<div class="field">
									<label class="label">Lastname</label>
									<div class="control">
										<input class="input" type="text" name="lastName" value="${vm.lastName}"></input>
									</div>
								</div>
							</div>
							<div class="cell">
								<div class="field">
									<label class="label">Street</label>
									<div class="control">
										<input class="input" type="text" name="streetName" value="${vm.streetName}"></input>
									</div>
								</div>
							</div>
						</div>
					</div>
					<nav class="level">
						<button
							class="level-item button"
							_="on click halt the event then send ${eventName('PersonEditor_CloseRequested')}(id:${vm.id})"
						>&lt; Back
						</button>
						<button
							type="submit"
							class="level-item button is-primary"
							hx-trigger="click consume"
							hx-put="${personActionUrls.UpdatePerson.url(vm.id)}"
							hx-swap="none"
						>Save
						</button>
					</nav>
				</form>
			</div>
		</td>
	</tr>
`;
