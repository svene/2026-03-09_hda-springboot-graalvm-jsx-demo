const BASE = '';

export const HonoWebApiConsts = {
	PAGE: `${BASE}/page`,
	PAGE_MENU_ID: 'oob', // TODO: move out of here
	PERSON_TABLE: `${BASE}/persontable`,
	PERSON_DETAILS: `${BASE}/person/{id}/details`,
	PERSON_DETAILS_ROW: `${BASE}/person/{id}/detailsrow`,
	PERSON_EDIT: `${BASE}/person/{id}/edit`,
	PERSON: `${BASE}/person/{id}`,
	PERSON_ROW: `${BASE}/person/{id}/row`,
	PERSON_DETAILS_CARD: `${BASE}/person/{id}/detailscard`,
	DELETE: `${BASE}/delete`,
};
export const EvtBackendEvents = {
	PERSON_UPDATED: 'person-updated',
};
