import {Layout} from "./layout";
import {PersonPageModel} from "./vm/person-page-model-vm";
import {HonoWebApiConsts} from "./hono-web-api-shared-consts";
import {PersonTable} from "./persontable";

export const Page = (vm: PersonPageModel) => (
	<Layout>
		<div className="container mt-1">

			<div className="p-1 mt-1 area-border" style="min-height: 500px">
				<div className="field">
					<label class="label">Search</label>
					<div className="control">
						<input
							class="input"
							type="search"
							name="search"
							placeholder="Search for firstname or lastname"
							hx-trigger="input changed delay:500ms"
							hx-get={HonoWebApiConsts.PERSON_TABLE}
							hx-target="#result-table"
						/>
					</div>
				</div>
				<PersonTable vm={vm.table}></PersonTable>
			</div>

		</div>
	</Layout>
);
