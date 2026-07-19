export type RouteDefinition = {
	url: (...args: any[]) => string;
	render: (vm: any) => string;
};
export type ActionUrlDefinition = {
	url: (...args: any[]) => string;
};
