import {PersonTableRowModel} from "./generated/types/vm-types";
import {personRoutes} from "./routes";

export const PersonRow = ({vm}: {vm: PersonTableRowModel}) => (
	<tr
		id={`row-${vm.id}`}
		style="cursor: pointer"
		hx-trigger="click"
		hx-target="this"
		hx-swap="outerHTML"
		hx-get={personRoutes.PersonDetails.url(vm.id)}
	>
		{/* htmx 4 only wires up hx-trigger on elements that also carry an action
		  * attribute (hx-get/post/etc); a bare "click consume" here would silently
		  * never run, so use hx-on:click to stop the checkbox click from also
		  * triggering the row's own click-to-expand handler. */}
		<td hx-on:click="event.stopPropagation()">
			<input type="checkbox" name="selection" value={vm.id} form="bulkDeleteForm"></input>
		</td>
		<td>{vm.firstName}</td>
		<td>{vm.lastName}</td>
		<td>{vm.streetName}</td>
		<td><span class="icon"><i class="material-icons">arrow_drop_down</i></span></td>
	</tr>

);
