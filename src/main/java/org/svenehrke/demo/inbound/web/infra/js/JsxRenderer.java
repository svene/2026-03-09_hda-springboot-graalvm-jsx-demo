package org.svenehrke.demo.inbound.web.infra.js;

import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.svenehrke.demo.inbound.web.PageVM;
import org.svenehrke.demo.inbound.web.UserVM;
import org.svenehrke.demo.app.AppConfigProperties;
import org.svenehrke.demo.app.RuntimeEnvironment;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Service
public class JsxRenderer {

	private final RuntimeEnvironment runtimeEnvironment;
	private final AppConfigProperties appConfigProperties;
	private JsInitializer jsInitializer;

	private final Resource resource;


	public JsxRenderer(
		RuntimeEnvironment runtimeEnvironment,
		AppConfigProperties appConfigProperties
	) {
		this.runtimeEnvironment = runtimeEnvironment;
		this.appConfigProperties = appConfigProperties;
		this.resource = appConfigProperties.ssr().resource();
	}

	@PostConstruct
	public void init() throws IOException {
		jsInitializer = new JsInitializer(
			appConfigProperties.ssr().resource().getFilename(),
			new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8),
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
