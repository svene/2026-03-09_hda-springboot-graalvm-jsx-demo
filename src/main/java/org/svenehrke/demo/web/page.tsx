import {Layout} from "./layout";
import {Hello} from "./hello";
import {PageVM} from "./models-vm";

export const Page = (props: PageVM) => (
	<Layout>
		<div>Name: {props.user.name}</div>
		<div>Age: {props.user.age}</div>
		<Hello message="Hi there!"></Hello>
	</Layout>
);
