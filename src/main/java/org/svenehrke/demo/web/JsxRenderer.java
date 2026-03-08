package org.svenehrke.demo.web;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.svenehrke.demo.inbound.web.PageVM;
import org.svenehrke.demo.inbound.web.UserVM;
import org.svenehrke.demo.web.infra.JsInitializer;

import java.io.IOException;

@Service
public class JsxRenderer {

	private final RuntimeEnvironment runtimeEnvironment;
	private final AppConfigProperties appConfigProperties;
	private JsInitializer jsInitializer;

	public JsxRenderer(
		RuntimeEnvironment runtimeEnvironment,
		AppConfigProperties appConfigProperties
	) {
		this.runtimeEnvironment = runtimeEnvironment;
		this.appConfigProperties = appConfigProperties;
	}

	@PostConstruct
	public void init() throws IOException {
		jsInitializer = new JsInitializer(
			appConfigProperties.ssr().filename(),  // TODO: use resource, not file location
			appConfigProperties.ssr().entryfunction()
		);
	}


	public String renderPage(String name, int age) {
		if (runtimeEnvironment.isDevMode()) {
			try {
				init();
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		}
		var pageVM = new PageVM(new UserVM(name, age));

		var result = jsInitializer.getEntryFunction().execute(JsConverter.toJs(pageVM));
		return result.asString();
	}

}
