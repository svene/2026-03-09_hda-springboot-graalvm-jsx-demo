export type RouteDefinition = {
	url: (...args: any[]) => string;
	render: (vmJson: string) => string;
};
export type ActionUrlDefinition = {
	url: (...args: any[]) => string;
};
