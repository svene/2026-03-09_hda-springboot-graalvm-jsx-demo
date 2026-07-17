import {PersondetailsRow} from "./persondetailrow";
import {PersonDetailModel} from "./generated/types/vm-types";
import {PersondetailsCard} from "./persondetailscard";

export const PersonDetails = ({vm}: {vm: PersonDetailModel}) => (
	<>
		<PersondetailsRow vm={vm}/>
		<PersondetailsCard vm={vm}/>
	</>
);
