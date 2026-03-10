import {Layout} from "./layout";
import {Hello} from "./hello";
import {PersonPageModel} from "./vm/person-page-model-vm";

export const Page = (props: PersonPageModel) => (
	<Layout>
		<div>PersonPage</div>
		{/*<div>Name: {props.user.name}</div>*/}
		{/*<div>Age: {props.user.age}</div>*/}
		<Hello message="Hi there!"></Hello>
	</Layout>
);
