import {HonoWebApiConsts} from "./hono-web-api-shared-consts";
import {PersonTableModel} from "./vm/person-page-model-vm";
import {PersonRow} from "./personrow";

export const PersonTable = (props: { vm: PersonTableModel }) => (
	<div id="result-table">
		<table class="table">
			<thead>
			<tr>
				<td colSpan={5}>
					<form id="bulkDeleteForm" hx-delete={HonoWebApiConsts.DELETE}>
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
			{props.vm.people.map((it) => (<PersonRow vm={it}/>))}
			</tbody>
		</table>
		<div>{props.vm.people.length} of total {props.vm.total}</div>

	</div>
);
