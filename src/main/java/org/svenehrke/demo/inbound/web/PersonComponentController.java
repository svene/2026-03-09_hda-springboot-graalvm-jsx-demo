package org.svenehrke.demo.inbound.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.svenehrke.demo.core.PeopleService;
import org.svenehrke.demo.inbound.web.infra.js.JsxRenderer;

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
		Object vm = switch (name) {
			case "PersonDetails", "PersondetailsCard", "PersondetailsRow"
				-> peopleService.personDetailModel(id);
			case "PersonTable" -> peopleService.peopleForSearch(request.getParameter("search"));
			case "PersonRow" -> peopleService.personTableRowModel(id);
			case "PersonEditor" -> peopleService.personEditModel(id);
			default -> null;
		};
		return renderer.render(name, vm);
	}

}
