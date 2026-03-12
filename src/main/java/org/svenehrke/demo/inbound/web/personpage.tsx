import {Layout} from "./layout";
import {PersonPageModel} from "./vm/person-page-model-vm";
import {HonoWebApiConsts} from "./hono-web-api-shared-consts";
import {PersonTable} from "./persontable";

export const Page = ({vm}: {vm: PersonPageModel}) => (
	<Layout>
		<div class="container mt-1">

			<div class="p-1 mt-1 area-border" style="min-height: 500px">
				<div class="field">
					<label class="label">Search</label>
					<div class="control">
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
