package org.svenehrke.demo.inbound.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.svenehrke.demo.core.PeopleService;
import org.svenehrke.demo.inbound.web.infra.js.JsxRenderer;

import static org.svenehrke.demo.inbound.web.JTSPersonRouteName.*;

@RestController
@RequestMapping(produces = MediaType.TEXT_HTML_VALUE)
public class PersonComponentController {

	private final PeopleService peopleService;
	private final JsxRenderer renderer;

	@Value("${spring.profiles.active:}")
	private String activeProfile;
	// TODO: model.addAttribute("devMode", activeProfile.contains("dev"));

	public PersonComponentController(PeopleService peopleService, JsxRenderer renderer) {
		this.peopleService = peopleService;
		this.renderer = renderer;
	}

	@GetMapping("/component/{name}") // SPRING-HONO
	public String component(@PathVariable String name, @RequestParam(name = "id", required = false) Integer id, HttpServletRequest request) {
		JTSPersonRouteName routeName;
		try {
			routeName = valueOf(name);
		} catch (IllegalArgumentException e) {
			return renderer.render(PersonRow.name(), null); // TODO: return 404-response
		}
		Object vm = switch (routeName) {
			case Page -> new PersonPageModel(peopleService.personTableModel());
			case PersonDetails, PersonDetailsCard, PersonDetailsRow
				-> peopleService.personDetailModel(id);
			case PersonTable -> peopleService.peopleForSearch(request.getParameter("search"));
			case PersonRow -> peopleService.personTableRowModel(id);
			case PersonEditor -> peopleService.personEditModel(id);
		};
		return renderer.render(name, vm);
	}

}
