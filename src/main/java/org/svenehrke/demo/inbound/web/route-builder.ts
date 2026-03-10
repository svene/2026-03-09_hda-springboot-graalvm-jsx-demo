import {HonoWebApiConsts} from "./hono-web-api-shared-consts";

const idUrl = (url: string, id: number) =>
	`${url.replace('{id}', id + '')}`;

export const detailsRowUrl = (id: number) =>
	idUrl(HonoWebApiConsts.PERSON_DETAILS_ROW, id);

export const detailsUrl = (id: number) =>
	idUrl(HonoWebApiConsts.PERSON_DETAILS, id);

// export const detailsBackUrl = (id: number) =>
// 	idUrl(HonoWebApiConsts.PERSON_DETAILS_BACK, id);

export const editUrl = (id: number) =>
	idUrl(HonoWebApiConsts.PERSON_EDIT, id);

export const detailsCardUrl = (id: number) =>
	idUrl(HonoWebApiConsts.PERSON_DETAILS_CARD, id);

export const updateUrl = (id: number) =>
	idUrl(HonoWebApiConsts.PERSON, id);

export const rowUrl = (id: number) =>
	idUrl(HonoWebApiConsts.PERSON_ROW, id);
