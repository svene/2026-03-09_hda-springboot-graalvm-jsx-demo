import {PersonDetailsRow} from "./persondetailrow";
import {PersonDetailModel} from "./generated/types/vm-types";
import {PersonDetailsCard} from "./personDetailsCard";

export const PersonDetails = ({vm}: {vm: PersonDetailModel}) => (
	<>
		<PersonDetailsRow vm={vm}/>
		<PersonDetailsCard vm={vm}/>
	</>
);
