import {html} from "hono/html";
import {PersonDetailsRow} from "./persondetailrow";
import {PersonDetailModel} from "./generated/types/vm-types";
import {PersonDetailsCard} from "./personDetailsCard";
import {HtmlResult} from "./route-types";

export const PersonDetails = (vm: PersonDetailModel): HtmlResult => html`
	${PersonDetailsRow(vm)}
	${PersonDetailsCard(vm)}
`;
