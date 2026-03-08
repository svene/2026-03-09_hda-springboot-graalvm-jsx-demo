package org.svenehrke.demo.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;
import org.svenehrke.demo.core.Person;
import org.graalvm.polyglot.*;

import java.util.List;

@RestController
public class MainController {

	private final JsxRenderer renderer;
	private final AppConfig appConfig;

	public MainController(
		JsxRenderer renderer,
		AppConfig appConfig
	) {
		this.renderer = renderer;
		this.appConfig = appConfig;
	}

	@GetMapping("/")
	public RedirectView index() {
		return new RedirectView("/user");
	}

	@GetMapping("/user")
	@ResponseBody
	public String getUser() {

		// fetch from DB
		String name = "John";
		int age = 42;

		return renderer.renderPage(name, age);
	}

	@GetMapping("/persons")
	public List<Person> persons()
	{
		return List.of(new Person("John", "Doe"), new Person("Jane", "Doe"));
	}

}
