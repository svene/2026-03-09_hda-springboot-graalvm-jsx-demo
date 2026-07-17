package org.svenehrke.demo.inbound.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.svenehrke.demo.core.PeopleService;
import org.svenehrke.demo.inbound.web.infra.js.JsxRenderer;

import java.util.List;

import static org.svenehrke.demo.inbound.web.HTMXConsts.HX_REDIRECT;

@RestController
@RequestMapping(produces = MediaType.TEXT_HTML_VALUE)
public class PagesController {

	public static final String PAGE_URL = "/page";

	private final PeopleService peopleService;
	private final JsxRenderer renderer;

	@Value("${spring.profiles.active:}")
	private String activeProfile;

	public PagesController(PeopleService peopleService, JsxRenderer renderer) {
		this.peopleService = peopleService;
		this.renderer = renderer;
	}

	@GetMapping("/page") // SPRING-HONO
	public String page() {
		// TODO: model.addAttribute("devMode", activeProfile.contains("dev"));
		var vm = new PersonPageModel(peopleService.personTableModel());
		return renderer.render("Page", vm);
	}

	@GetMapping("/component/{name}") // SPRING-HONO
	public String component(@PathVariable String name, @RequestParam("id") int id, HttpServletRequest request) {
		Object vm = switch (name) {
			case "PersonDetails" -> peopleService.personDetailModel(id);
			case "PersonTable" -> peopleService.peopleForSearch(request.getParameter("search"));
			case "PersonRow" -> peopleService.personTableRowModel(id);
			case "PersonEditor" -> peopleService.personEditModel(id);
			case "PersondetailsCard" -> peopleService.personDetailModel(id);
			case "PersondetailsRow" -> peopleService.personDetailModel(id);
			default -> null;
		};
		return renderer.render(name, vm);
	}

	@PutMapping("/person/{id}") // SPRING-HONO
	public void updatePerson(@PathVariable int id, PersonEditModel personEditModel, HttpServletResponse response) {
		peopleService.updatePerson(id, personEditModel);
		response.setHeader(HTMXConsts.HX_TRIGGER, """
			{"%s": {"id": %d}}\
			""".formatted(PersonEvents.PERSON_UPDATED, id));
	}
	@DeleteMapping("/delete") // SPRING-HONO
	public void deleteRows(@RequestParam List<Integer> selection, HttpServletResponse response) {
		peopleService.deleteByIds(selection);
		response.setHeader(HX_REDIRECT, PAGE_URL);
	}

	// SPRING-HONO: routes.tsx:personEvents
	private static class PersonEvents {
		public static  final String PERSON_UPDATED = "person-updated";
	}
}
