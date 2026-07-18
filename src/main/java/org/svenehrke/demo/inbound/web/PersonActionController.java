package org.svenehrke.demo.inbound.web;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.svenehrke.demo.core.PeopleService;

import java.util.List;

import static org.svenehrke.demo.inbound.web.HTMXConsts.HX_REDIRECT;

@RestController
@RequestMapping(produces = MediaType.TEXT_HTML_VALUE)
public class PersonActionController {

	private final PeopleService peopleService;

	public PersonActionController(PeopleService peopleService) {
		this.peopleService = peopleService;
	}

	@PutMapping("/person/{id}") // SPRING-HONO
	public void updatePerson(@PathVariable int id, PersonEditModel personEditModel, HttpServletResponse response) {
		peopleService.updatePerson(id, personEditModel);
		response.setHeader(HTMXConsts.HX_TRIGGER, """
			{"%s": {"id": %d}}\
			""".formatted(JTSPersonEventName.PERSON_UPDATED.name(), id));
	}
	@DeleteMapping("/delete") // SPRING-HONO
	public void deleteRows(@RequestParam List<Integer> selection, HttpServletResponse response) {
		peopleService.deleteByIds(selection);
		response.setHeader(HX_REDIRECT, JTSPersonUrls.PAGE_URL);
	}

}
