import { renderToString } from 'hono/jsx/dom/server';
import {PersonPageModel} from "./vm/person-page-model-vm";
import {Page} from "./personpage";

export function renderPage(vm: PersonPageModel): string {
	return renderToString(<Page {...vm} />) // TODO: make independent of PageVM and <Page> or have multiple render.tsx files ?
}
