import {html} from "hono/html";
import {PersonTableModel} from "./generated/types/vm-types";
import {PersonRow} from "./personrow";
import {personActionUrls} from "./routes";
import {HtmlResult} from "./route-types";

export const PersonTable = (vm: PersonTableModel): HtmlResult => html`
	<div id="result-table">
		<table class="table">
			<thead>
			<tr>
				<td colspan="5">
					<form id="bulkDeleteForm" hx-delete="${personActionUrls.Delete.url()}">
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
			${vm.people.map((it) => PersonRow(it))}
			</tbody>
		</table>
		<div>${vm.people.length} of total ${vm.total}</div>

	</div>
`;
