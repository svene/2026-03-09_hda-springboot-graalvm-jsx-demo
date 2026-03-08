import {Layout} from "./layout";
import {User} from "./models";
import {Hello} from "./hello";

export const Page = (props: User) => (
	<Layout>
		<div>Name: {props.user.name}</div>
		<div>Age: {props.user.age}</div>
		<Hello message="Hi there!"></Hello>
	</Layout>
);
