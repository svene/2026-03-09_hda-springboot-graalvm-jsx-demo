import {html} from "hono/html";
import {HtmlResult} from "./route-types";

export const Hello = (props: { message: string }): HtmlResult =>
	html`<div>Hello Component: ${props.message}</div>`;
