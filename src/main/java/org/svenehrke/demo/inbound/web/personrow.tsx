import {PersonTableRowModel} from "./vm/person-page-model-vm";
import {detailsUrl} from "./route-builder";

export const PersonRow = ({vm}: {vm: PersonTableRowModel}) => (
	<tr
		id={`row-${vm.id}`}
		style="cursor: pointer"
		hx-trigger="click"
		hx-target="this"
		hx-swap="outerHTML"
		hx-get={detailsUrl(vm.id)}
	>
		<td hx-trigger="click consume"> {/* consume: prevent bubbling, only checkbox needs to be clicked, not parents*/}
			<input type="checkbox" name="selection" value={vm.id} form="bulkDeleteForm"></input>
		</td>
		<td>{vm.firstName}</td>
		<td>{vm.lastName}</td>
		<td>{vm.streetName}</td>
		<td><span class="icon"><i class="material-icons">arrow_drop_down</i></span></td>
	</tr>

);
