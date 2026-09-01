package org.svenehrke.demo.inbound.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.svenehrke.demo.core.PeopleService;
import org.svenehrke.demo.inbound.web.infra.js.JsxRenderer;

import static org.svenehrke.demo.inbound.web.JTSPersonRouteName.*;

@RestController
@RequestMapping(produces = MediaType.TEXT_HTML_VALUE)
public class PersonUIController {

	private final PeopleService peopleService;
	private final JsxRenderer renderer;

	@Value("${spring.profiles.active:}")
	private String activeProfile;
	// TODO: model.addAttribute("devMode", activeProfile.contains("dev"));

	public PersonUIController(PeopleService peopleService, JsxRenderer renderer) {
		this.peopleService = peopleService;
		this.renderer = renderer;
	}

	/**
	 * Handles every uiroute whose vm only ever depends on an (optional) {@code id}. A route needing
	 * different or additional parameters — like {@link #personTable} below — gets its own dedicated
	 * mapping instead of growing this method's signature; Spring MVC matches the literal path first,
	 * so the two coexist without ambiguity.
	 */
	@GetMapping("/uiroute/{name}") // Java-HONO
	public String uiroute(@PathVariable String name, @RequestParam(name = "id", required = false) Integer id) {
		JTSPersonRouteName routeName;
		try {
			routeName = valueOf(name);
		} catch (IllegalArgumentException e) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown uiroute: " + name);
		}
		Object vm = switch (routeName) {
			case Page -> new PersonPageModel(peopleService.personTableModel());
			case PersonDetails, PersonDetailsCard, PersonDetailsRow
				-> peopleService.personDetailModel(id);
			case PersonRow -> peopleService.personTableRowModel(id);
			case PersonEditor -> peopleService.personEditModel(id);
			default -> throw new IllegalStateException(
				routeName + " is served by its own dedicated endpoint, not " + getClass().getSimpleName() + "#uiroute");
		};
		return renderer.render(routeName, vm);
	}

	@GetMapping("/uiroute/PersonTable") // Java-HONO
	public String personTable(@RequestParam(name = "search", required = false) String search) {
		return renderer.render(PersonTable, peopleService.peopleForSearch(search));
	}

}
