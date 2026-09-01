import {html} from "hono/html";
import {PersonTableRowModel} from "./generated/types/vm-types";
import {personRoutes} from "./routes";
import {HtmlResult} from "./route-types";

// htmx 4 only wires up hx-trigger on elements that also carry an action
// attribute (hx-get/post/etc); a bare "click consume" on the checkbox cell
// would silently never run, so use hx-on:click to stop the checkbox click
// from also triggering the row's own click-to-expand handler.
export const PersonRow = (vm: PersonTableRowModel): HtmlResult => html`
	<tr
		id="row-${vm.id}"
		style="cursor: pointer"
		hx-trigger="click"
		hx-target="this"
		hx-swap="outerHTML"
		hx-get="${personRoutes.PersonDetails.url(vm.id)}"
	>
		<td hx-on:click="event.stopPropagation()">
			<input type="checkbox" name="selection" value="${vm.id}" form="bulkDeleteForm"></input>
		</td>
		<td>${vm.firstName}</td>
		<td>${vm.lastName}</td>
		<td>${vm.streetName}</td>
		<td><span class="icon"><i class="material-icons">arrow_drop_down</i></span></td>
	</tr>
`;
