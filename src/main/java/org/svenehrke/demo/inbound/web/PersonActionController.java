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
public class PersonActionController {

	public static final String PAGE_URL = "/page";

	private final PeopleService peopleService;
	private final JsxRenderer renderer;

	public PersonActionController(PeopleService peopleService, JsxRenderer renderer) {
		this.peopleService = peopleService;
		this.renderer = renderer;
	}

	@GetMapping("/page") // SPRING-HONO
	public String page() {
		// TODO: model.addAttribute("devMode", activeProfile.contains("dev"));
		var vm = new PersonPageModel(peopleService.personTableModel());
		return renderer.render("Page", vm);
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
