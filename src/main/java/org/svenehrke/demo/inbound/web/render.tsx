import { renderToString } from 'hono/jsx/dom/server';
import {PersonDetailModel, PersonPageModel, PersonTableRowModel} from "./vm/person-page-model-vm";
import {Page} from "./personpage";
import {PersonDetails} from "./persondetails";
import {PersonRow} from "./personrow";

export function renderPage(vm: PersonPageModel): string {
	return renderToString(<Page vm={vm} />)
}
export function personRow(vm: PersonTableRowModel): string {
	return renderToString(<PersonRow vm={vm}/>)
}
export function personDetails(vm: PersonDetailModel): string {
	return renderToString(<PersonDetails vm={vm} />)
}
