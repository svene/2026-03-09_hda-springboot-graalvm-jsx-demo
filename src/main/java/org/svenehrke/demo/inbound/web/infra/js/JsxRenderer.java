package org.svenehrke.demo.inbound.web.infra.js;

import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
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
		resource = appConfigProperties.ssr().resource();
	}

	@PostConstruct
	public void init() throws IOException {
		jsInitializer = new JsInitializer(
			appConfigProperties.ssr().resource().getFilename(),
			new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)
		);
	}

	public String render(String entryFunctionName, Object vm) {
		if (runtimeEnvironment.isDevMode()) {
			try {
				init();
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		}
		var result = jsInitializer.getEntryFunction(entryFunctionName).execute(JsConverter.toJs(vm));
		return result.asString();
	}

}
