package org.svenehrke.demo.inbound.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
	@GetMapping("/")
	public String redirectRoot() {
		return "redirect:" + HonoWebApiSharedConsts.HonoWebApiConsts.PAGE;
	}
}
