import {html} from "hono/html";
import {Layout} from "./layout";
import {PersonPageModel} from "./generated/types/vm-types";
import {PersonTable} from "./persontable";
import {personRoutes} from "./routes";
import {HtmlResult} from "./route-types";

export const Page = (vm: PersonPageModel): HtmlResult => Layout(html`
	<div class="container mt-1">

		<div class="p-1 mt-1 area-border" style="min-height: 500px">
			<div class="field" data-testid="search-field">
				<label class="label">Search</label>
				<div class="control">
					<input
						class="input"
						type="search"
						name="search"
						placeholder="Search for firstname or lastname"
						hx-trigger="input changed delay:500ms"
						hx-get="${personRoutes.PersonTable.url()}"
						hx-target="#result-table"
					/>
				</div>
			</div>
			${PersonTable(vm.table)}
		</div>

	</div>
`);
