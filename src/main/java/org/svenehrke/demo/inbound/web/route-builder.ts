import {HonoWebApiConsts} from "./hono-web-api-shared-consts";

const idUrl = (url: string, id: number) =>
	`${url.replace('{id}', id + '')}`;

export const updateUrl = (id: number) =>
	idUrl(HonoWebApiConsts.PERSON, id);

