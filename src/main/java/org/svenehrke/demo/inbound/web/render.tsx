import { renderToString } from 'hono/jsx/dom/server';
import {Page} from "./personpage";
import {PersonDetails} from "./persondetails";
import {PersonRow} from "./personrow";
import {PersonEditor} from "./personedit";
import {PersondetailsCard} from "./persondetailscard";
import {PersondetailsRow} from "./persondetailrow";
import {PersonTable} from "./persontable";

export function renderPage(vmJson: string): string {
	const vm = JSON.parse(vmJson);
	return renderToString(<Page vm={vm} />)
}
export function personDetails(vmJson: string): string {
	const vm = JSON.parse(vmJson);
	return renderToString(<PersonDetails vm={vm} />)
}
export function personRow(vmJson: string): string {
	const vm = JSON.parse(vmJson);
	return renderToString(<PersonRow vm={vm}/>)
}
export function personEdit(vmJson: string): string {
	const vm = JSON.parse(vmJson);
	return renderToString(<PersonEditor vm={vm}/>)
}
export function personDetailsCard(vmJson: string): string {
	const vm = JSON.parse(vmJson);
	return renderToString(<PersondetailsCard vm={vm}/>)
}
export function personDetailsRow(vmJson: string): string {
	const vm = JSON.parse(vmJson);
	return renderToString(<PersondetailsRow vm={vm} />)
}
export function personTable(vmJson: string): string {
	const vm = JSON.parse(vmJson);
	return renderToString(<PersonTable vm={vm} />)
}
