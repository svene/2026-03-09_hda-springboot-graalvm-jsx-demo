import { renderToString } from 'hono/jsx/dom/server';
import {PageVM} from "./models-vm";
import {Page} from "./page";

export function renderPage(vm: PageVM): string {
	return renderToString(<Page {...vm} />)
}
