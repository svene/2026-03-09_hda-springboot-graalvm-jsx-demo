import {PersondetailsRow} from "./persondetailrow";
import {PersonDetailModel} from "./vm/person-page-model-vm";
import {PersondetailsCard} from "./persondetailscard";

export const PersonDetails = (vm: PersonDetailModel) => (
	<>
		<PersondetailsRow vm={vm}/>
		<PersondetailsCard vm={vm}/>
	</>
);
