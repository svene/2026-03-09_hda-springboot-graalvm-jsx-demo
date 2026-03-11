import { renderToString } from 'hono/jsx/dom/server';
import {PersonDetailModel, PersonEditModel, PersonPageModel, PersonTableModel, PersonTableRowModel} from "./vm/person-page-model-vm";
import {Page} from "./personpage";
import {PersonDetails} from "./persondetails";
import {PersonRow} from "./personrow";
import {PersonEditor} from "./personedit";
import {PersondetailsCard} from "./persondetailscard";
import {PersondetailsRow} from "./persondetailrow";
import {PersonTable} from "./persontable";

export function renderPage(vm: PersonPageModel): string {
	return renderToString(<Page vm={vm} />)
}
export function personDetails(vm: PersonDetailModel): string {
	return renderToString(<PersonDetails vm={vm} />)
}
export function personRow(vm: PersonTableRowModel): string {
	return renderToString(<PersonRow vm={vm}/>)
}
export function personEdit(vm: PersonEditModel): string {
	return renderToString(<PersonEditor vm={vm}/>)
}
export function personDetailsCard(vm: PersonDetailModel): string {
	return renderToString(<PersondetailsCard vm={vm}/>)
}
export function personDetailsRow(vm: PersonDetailModel): string {
	return renderToString(<PersondetailsRow vm={vm} />)
}
export function personTable(vm: PersonTableModel): string {
	return renderToString(<PersonTable vm={vm} />)
}
