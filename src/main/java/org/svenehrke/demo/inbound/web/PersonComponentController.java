package org.svenehrke.demo.inbound.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.svenehrke.demo.core.PeopleService;
import org.svenehrke.demo.inbound.web.infra.js.JsxRenderer;

import static org.svenehrke.demo.inbound.web.PersonRouteName.*;

@RestController
@RequestMapping(produces = MediaType.TEXT_HTML_VALUE)
public class PersonComponentController {

	private final PeopleService peopleService;
	private final JsxRenderer renderer;

	@Value("${spring.profiles.active:}")
	private String activeProfile;

	public PersonComponentController(PeopleService peopleService, JsxRenderer renderer) {
		this.peopleService = peopleService;
		this.renderer = renderer;
	}

	@GetMapping("/component/{name}") // SPRING-HONO
	public String component(@PathVariable String name, @RequestParam("id") int id, HttpServletRequest request) {
		PersonRouteName routeName;
		try {
			routeName = valueOf(name);
		} catch (IllegalArgumentException e) {
			return renderer.render(PersonRow.name(), null); // TODO: return 404-response
		}
		Object vm = switch (routeName) {
			case PersonDetails, PersondetailsCard , PersondetailsRow
				-> peopleService.personDetailModel(id);
			case PersonTable -> peopleService.peopleForSearch(request.getParameter("search"));
			case PersonRow -> peopleService.personTableRowModel(id);
			case PersonEditor -> peopleService.personEditModel(id);
		};
		return renderer.render(name, vm);
	}

}
