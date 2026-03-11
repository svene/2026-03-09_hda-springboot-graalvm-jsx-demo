package org.svenehrke.demo.inbound.web.infra.js;

import org.graalvm.polyglot.Engine;
import org.graalvm.polyglot.Source;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.svenehrke.demo.app.AppConfigProperties;
import org.svenehrke.demo.app.RuntimeEnvironment;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class JsxRenderer {

	private final RuntimeEnvironment runtimeEnvironment;
	private final JsContextPool jsContextPool;

	private final Resource resource;
	private final Engine engine;
	private volatile Source source;


	public JsxRenderer(
		RuntimeEnvironment runtimeEnvironment,
		AppConfigProperties appConfigProperties
	) {
		this.runtimeEnvironment = runtimeEnvironment;
		resource = appConfigProperties.ssr().resource();
		engine = Engine.create();
		reloadSource();

		int poolSize = Runtime.getRuntime().availableProcessors();
		jsContextPool = new JsContextPool(poolSize, this::buildJsInitializer, runtimeEnvironment.isDevMode());
	}

	private JsInitializer buildJsInitializer() {
		return new JsInitializer(engine, source);
	}
	private synchronized void reloadSource() {
		try {
			String code = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
			source = Source.newBuilder("js", code, resource.getFilename()).build();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	public String render(String entryFunctionName, Object vm) {
		if (runtimeEnvironment.isDevMode()) {
			reloadSource();
		}
		JsInitializer ctx = null;
		try {
			ctx = jsContextPool.borrow();
			var result = ctx.getEntryFunction(entryFunctionName).execute(JsConverter.toJs(vm));
			return result.asString();
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
		finally {
			if (ctx != null) {
				jsContextPool.release(ctx);
			}
		}
	}

}
