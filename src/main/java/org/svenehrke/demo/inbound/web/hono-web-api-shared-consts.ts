const BASE = '';

/**
 * These constants have two main purposes:
 * 1. in the TSX templates for the HTML-links or htmx-actions:
 *    this is done indirectly via route-builder.ts.
 *    See `hx-get={detailsUrl(vm.id)}` in `personrow.tsx` as an example.
 *
 * 2. For the Controller-Endpoints in the Java-Spring part.
 *    See PagesController.java on how they are used.
 *    Note that the Java-Constants used in the Controller are generated
 *    from the constants here in this file.
 *    The generator code is located in the folder `javagen`.
 **/
export const HonoWebApiConsts = {
	PAGE: `${BASE}/page`,//
	PAGE_MENU_ID: 'oob', // TODO: move out of here
	PERSON_TABLE: `${BASE}/persontable`,//
	PERSON_DETAILS: `${BASE}/person/{id}/details`,//
	PERSON_DETAILS_ROW: `${BASE}/person/{id}/detailsrow`,//
	PERSON_EDIT: `${BASE}/person/{id}/edit`,//
	PERSON: `${BASE}/person/{id}`,
	PERSON_ROW: `${BASE}/person/{id}/row`,//
	PERSON_DETAILS_CARD: `${BASE}/person/{id}/detailscard`,//
	DELETE: `${BASE}/delete`,
};
export const EvtBackendEvents = {
	PERSON_UPDATED: 'person-updated',
};
