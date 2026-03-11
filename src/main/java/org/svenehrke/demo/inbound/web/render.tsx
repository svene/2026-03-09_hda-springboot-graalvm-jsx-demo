import { renderToString } from 'hono/jsx/dom/server';
import {PersonDetailModel, PersonPageModel} from "./vm/person-page-model-vm";
import {Page} from "./personpage";
import {PersonDetails} from "./persondetails";

export function renderPage(vm: PersonPageModel): string {
	return renderToString(<Page {...vm} />)
}
export function personDetails(vm: PersonDetailModel): string {
	return renderToString(<PersonDetails {...vm} />)
}
