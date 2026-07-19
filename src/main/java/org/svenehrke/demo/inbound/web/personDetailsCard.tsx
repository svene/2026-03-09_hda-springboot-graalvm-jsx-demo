import {PersonDetailModel} from "./generated/types/vm-types";
import {personRoutes} from "./routes";
import {eventName} from "./jtsperson";

export const PersonDetailsCard = ({vm}: { vm: PersonDetailModel }) => (
		<>
			<tr
				id={`row-${vm.id}-details`}
				style="cursor: pointer"
				hx-trigger="click"
				hx-target="this"
				hx-swap="outerHTML"
				hx-get={personRoutes.PersonEditor.url(vm.id)}
				_={`on ${eventName('PersonDetailsRow_CloseCmd')}(id) from <body/> if id == ${vm.id} remove me end`}
			>
				<td colSpan={5} style="padding-left: 30px">

						<div class="card p-5 my-2 mx-0">
							<div class="mb-1"><strong>Street:</strong> {vm.streetName} {vm.streetNo}</div>
							<div class="mb-1"><strong>City:</strong> {vm.zipCode} {vm.city}</div>
							<div class="mb-1"><strong>Mailbox:</strong> {vm.mailBox}</div>
							<div class="mb-1"><strong>Phone:</strong> {vm.phoneNumber}</div>
							<div class="mb-3"><strong>Cellphone:</strong> {vm.cellPhone}</div>
						</div>
				</td>
			</tr>
		</>
);
