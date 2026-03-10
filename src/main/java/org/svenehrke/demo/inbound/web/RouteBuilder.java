package org.svenehrke.demo.inbound.web;

import org.springframework.web.util.UriComponentsBuilder;

public interface RouteBuilder {
	String PAGE_URL = "/page";
	String DETAILS_URL = "/person/{id}/details";
	String DETAILS_ROW_URL = "/person/{id}/detailsrow";
	String DETAILS_CARD_URL = "/person/{id}/detailscard";
	String EDIT_URL = "/person/{id}/edit";
	String ROW_URL = "/person/{id}/row";
	String PERSON_URL = "/person/{id}";
	String PERSON_TABLE_URL = "/persontable";
	String DELETE_URL = "/delete";

	static String idUrl(String url, int id) {
		return UriComponentsBuilder.fromPath(url).buildAndExpand(id).toUriString();
	}
	static String url(String url) {
		return url;
	}
	static String detailsUrl(int id) {
		return idUrl(RouteBuilder.DETAILS_URL, id);
	}
	static String detailsRowUrl(int id) {
		return idUrl(RouteBuilder.DETAILS_ROW_URL, id);
	}
	static String editUrl(int id) {
		return idUrl(RouteBuilder.EDIT_URL, id);
	}
	static String detailsCardUrl(int id) {
		return idUrl(RouteBuilder.DETAILS_CARD_URL, id);
	}
	static String updateUrl(int id) {
		return idUrl(RouteBuilder.PERSON_URL, id);
	}
	static String rowUrl(int id) {
		return idUrl(RouteBuilder.ROW_URL, id);
	}
}
