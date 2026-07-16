export type RouteDefinition = {
	url: (...args: any[]) => string;
	render: (vmJson: string) => string;
};
export type RouteUrlDefinition = {
	url: (...args: any[]) => string;
};
