package org.svenehrke.demo.inbound.web;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.svenehrke.demo.core.PeopleService;
import org.svenehrke.demo.inbound.web.HonoWebApiSharedConsts.HonoWebApiConsts;
import org.svenehrke.demo.inbound.web.infra.js.JsxRenderer;

import java.util.List;

import static org.svenehrke.demo.inbound.web.HTMXConsts.HX_REDIRECT;

@RestController
@RequestMapping(produces = MediaType.TEXT_HTML_VALUE)
public class PagesController {

	private final PeopleService peopleService;
	private final JsxRenderer renderer;

	@Value("${spring.profiles.active:}")
	private String activeProfile;

	public PagesController(PeopleService peopleService, JsxRenderer renderer) {
		this.peopleService = peopleService;
		this.renderer = renderer;
	}

	@GetMapping(HonoWebApiConsts.PAGE)
	public String page1() {
		// TODO: model.addAttribute("devMode", activeProfile.contains("dev"));
		var vm = new PersonPageModel(peopleService.personTableModel());
		return renderer.render("renderPage", vm);
	}

	@GetMapping(HonoWebApiConsts.PERSON_DETAILS)
	public String details(@PathVariable int id) {
		PersonDetailModel vm = peopleService.personDetailModel(id);
		return renderer.render("personDetails", vm);
	}

	@GetMapping(HonoWebApiConsts.PERSON_ROW)
	public String row(@PathVariable int id) {
		PersonTableRowModel vm = peopleService.personTableRowModel(id);
		return renderer.render("personRow", vm);
	}

	@GetMapping(HonoWebApiConsts.PERSON_EDIT)
	public String edit(@PathVariable int id) {
		PersonEditModel vm = peopleService.personEditModel(id);
		return renderer.render("personEdit", vm);
	}

	@GetMapping(HonoWebApiConsts.PERSON_DETAILS_CARD)
	public String detailsCard(@PathVariable int id) {
		PersonDetailModel vm = peopleService.personDetailModel(id);
		return renderer.render("personDetailsCard", vm);
	}

	@PutMapping(HonoWebApiConsts.PERSON)
	public void updatePerson(@PathVariable int id, PersonEditModel personEditModel, HttpServletResponse response) {
		peopleService.updatePerson(id, personEditModel);
		response.setHeader(HTMXConsts.HX_TRIGGER, """
			{"%s": {"id": %d}}\
			""".formatted(HonoWebApiSharedConsts.EvtBackendEvents.PERSON_UPDATED, id));
	}
	@GetMapping(HonoWebApiConsts.PERSON_DETAILS_ROW)
	public String detailsRow(@PathVariable int id) {
		PersonDetailModel vm = peopleService.personDetailModel(id);
		return renderer.render("personDetailsRow", vm);
	}

	@GetMapping(HonoWebApiConsts.PERSON_TABLE)
	public String peopleUrl(@RequestParam() String search) {
		PersonTableModel vm = peopleService.peopleForSearch(search);
		return renderer.render("personTable", vm);
	}
	@DeleteMapping(HonoWebApiConsts.DELETE)
	public void deleteRows(@RequestParam List<Integer> selection, HttpServletResponse response) {
		peopleService.deleteByIds(selection);
		response.setHeader(HX_REDIRECT, HonoWebApiConsts.PAGE);
	}
}
