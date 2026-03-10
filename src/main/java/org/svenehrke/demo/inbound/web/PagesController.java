package org.svenehrke.demo.inbound.web;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.svenehrke.demo.core.PeopleService;
import org.svenehrke.demo.inbound.web.HonoWebApiSharedConsts.HonoWebApiConsts;
import org.svenehrke.demo.inbound.web.infra.js.JsxRenderer;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

import static org.svenehrke.demo.inbound.web.HTMXConsts.HX_REDIRECT;

@Controller
public class PagesController {

	private final JsonMapper jsonMapper;
	private final PeopleService peopleService;
	private final JsxRenderer renderer;

	@Value("${spring.profiles.active:}")
	private String activeProfile;

	public PagesController(JsonMapper jsonMapper, PeopleService peopleService, JsxRenderer renderer) {
		this.jsonMapper = jsonMapper;
		this.peopleService = peopleService;
		this.renderer = renderer;
	}

	@GetMapping("/")
	public String redirectRoot() {
		return "redirect:" + HonoWebApiConsts.PAGE;
	}

	@GetMapping(HonoWebApiConsts.PAGE)
	@ResponseBody
	public String page1() {
		// TODO:
		//	 model.addAttribute("devMode", activeProfile.contains("dev"));

		var vm = new PersonPageModel(peopleService.personTableModel());
		return renderer.renderPage(vm);
	}

	@GetMapping(HonoWebApiConsts.PERSON_DETAILS)
	public String details(@PathVariable int id, Model model) {
		PersonDetailModel vm = peopleService.personDetailModel(id);
		model.addAttribute("cmpName", "persondetails");
		model.addAttribute("vm", makeVM(vm));
		return "pages/tr";
	}

	@GetMapping(HonoWebApiConsts.PERSON_ROW)
	public String row(@PathVariable int id, Model model) {
		PersonTableRowModel vm = peopleService.personTableRowModel(id);
		model.addAttribute("cmpName", "personrow");
		model.addAttribute("vm", makeVM(vm));
		return "pages/tr";
	}

	@GetMapping(HonoWebApiConsts.PERSON_EDIT)
	public String edit(@PathVariable int id, Model model) {
		PersonEditModel vm = peopleService.personEditModel(id);
		model.addAttribute("cmpName", "personedit");
		model.addAttribute("vm", makeVM(vm));
		return "pages/tr";
	}

	@GetMapping(HonoWebApiConsts.PERSON_DETAILS_CARD)
	public String detailsCard(@PathVariable int id, Model model) {
		PersonDetailModel vm = peopleService.personDetailModel(id);
		model.addAttribute("cmpName", "persondetailscard");
		model.addAttribute("vm", makeVM(vm));
		return "pages/tr";
	}

	@PutMapping(HonoWebApiConsts.PERSON)
	public void updatePerson(@PathVariable int id, PersonEditModel personEditModel, HttpServletResponse response) {
		peopleService.updatePerson(id, personEditModel);
		response.setHeader(HTMXConsts.HX_TRIGGER, """
			{"%s": {"id": %d}}\
			""".formatted(HonoWebApiSharedConsts.EvtBackendEvents.PERSON_UPDATED, id));
	}
	@GetMapping(HonoWebApiConsts.PERSON_DETAILS_ROW)
	public String detailsRow(@PathVariable int id, Model model) {
		PersonDetailModel vm = peopleService.personDetailModel(id);
		model.addAttribute("cmpName", "persondetailrow");
		model.addAttribute("vm", makeVM(vm));
		return "pages/tr";
	}

	@GetMapping(HonoWebApiConsts.PERSON_TABLE)
	public String peopleUrl(@RequestParam() String search, Model model) {
		PersonTableModel vm = peopleService.peopleForSearch(search);
		model.addAttribute("cmpName", "persontable");
		model.addAttribute("vm", makeVM(vm));
		return "pages/div";
	}
	@DeleteMapping(HonoWebApiConsts.DELETE)
	public void deleteRows(@RequestParam List<Integer> selection, HttpServletResponse response) {
		peopleService.deleteByIds(selection);
		response.setHeader(HX_REDIRECT, HonoWebApiConsts.PAGE);
	}

	private String makeVM(Object vm) {
		record VMWrapper(Object vm) { }
		return jsonMapper.writeValueAsString(new VMWrapper(vm));
	}
}
