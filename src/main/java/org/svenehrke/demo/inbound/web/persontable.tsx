import {PersonTableModel} from "./generated/types/vm-types";
import {PersonRow} from "./personrow";
import {personActionUrls} from "./routes";

export const PersonTable = ({vm}: { vm: PersonTableModel }) => (
	<div id="result-table">
		<table class="table">
			<thead>
			<tr>
				<td colSpan={5}>
					<form id="bulkDeleteForm" hx-delete={personActionUrls.Delete.url()}>
						<button type="submit" class="button">
							<span class="icon"><i class="material-icons">delete</i></span>
							<span>Delete</span>
						</button>
					</form>
				</td>
			</tr>
			<tr>
				<th></th>
				<th>Firstname</th>
				<th>Lastname</th>
				<th>Street</th>
				<th></th>
			</tr>
			</thead>
			<tbody>
			{vm.people.map((it) => (<PersonRow vm={it}/>))}
			</tbody>
		</table>
		<div>{vm.people.length} of total {vm.total}</div>

	</div>
);
