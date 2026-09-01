import {html} from "hono/html";

/** The value produced by an `html` tagged-template component. */
export type HtmlResult = ReturnType<typeof html>;

export type RouteDefinition = {
	url: (...args: any[]) => string;
	render: (vm: any) => HtmlResult;
};
export type ActionUrlDefinition = {
	url: (...args: any[]) => string;
};
