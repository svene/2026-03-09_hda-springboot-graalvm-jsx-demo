package org.svenehrke.demo.inbound.web.infra.js;

import jakarta.annotation.PostConstruct;
import org.jspecify.annotations.NonNull;
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
	private final JsContextPool jsContextPool;

	private final Resource resource;


	public JsxRenderer(
		RuntimeEnvironment runtimeEnvironment,
		AppConfigProperties appConfigProperties
	) {
		this.runtimeEnvironment = runtimeEnvironment;
		this.appConfigProperties = appConfigProperties;
		resource = appConfigProperties.ssr().resource();
		int poolSize = Runtime.getRuntime().availableProcessors();
		jsContextPool = new JsContextPool(poolSize, this::buildJsInitializer, runtimeEnvironment.isDevMode());
	}

	private @NonNull JsInitializer buildJsInitializer() {
		try {
			return new JsInitializer(
				appConfigProperties.ssr().resource().getFilename(),
				new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)
			);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	public String render(String entryFunctionName, Object vm) {
		JsInitializer jsInitializer = null;
		try {
			jsInitializer = jsContextPool.borrow();
			var result = jsInitializer.getEntryFunction(entryFunctionName).execute(JsConverter.toJs(vm));
			return result.asString();
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
		finally {
			if (jsInitializer != null) {
				jsContextPool.release(jsInitializer);
			}
		}
	}

}
