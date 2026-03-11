package org.svenehrke.demo.inbound.web.infra.js;

import jakarta.annotation.PostConstruct;
import org.graalvm.polyglot.Engine;
import org.graalvm.polyglot.Source;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.svenehrke.demo.app.AppConfigProperties;
import org.svenehrke.demo.app.RuntimeEnvironment;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class JsxRenderer {

	private final JsContextPool jsContextPool;
	private final JsonMapper jsonMapper;

	private final Resource resource;
	private final Engine engine;
	private volatile Source source;


	public JsxRenderer(
		JsonMapper jsonMapper,
		AppConfigProperties appConfigProperties
	) {
		this.jsonMapper = jsonMapper;
		resource = appConfigProperties.ssr().resource();
		engine = Engine.create();

		int poolSize = Runtime.getRuntime().availableProcessors();
		jsContextPool = new JsContextPool(poolSize, this::buildJsInitializer);
	}

	@PostConstruct
	public void init() {
		reloadBundle();
//		jsContextPool.init();
	}

	private JsInitializer buildJsInitializer() {
		return new JsInitializer(engine, source);
	}

	/**
	 * Reloads the JS bundle and rebuilds the pool.
	 * Called by JsBundleWatcher when the file changes.
	 */
	public synchronized void reloadBundle() {
		try {
			String code = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
			source = Source.newBuilder("js", code, resource.getFilename()).build();
			jsContextPool.reset();
		}
		catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	public String render(String entryFunctionName, Object vm) {
		JsInitializer ctx = null;
		try {
			ctx = jsContextPool.borrow();
			String vmJson = jsonMapper.writeValueAsString(vm);
			var result = ctx.getEntryFunction(entryFunctionName).execute(vmJson);
			return result.asString();
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new RuntimeException(e);
		}
		finally {
			if (ctx != null) {
				jsContextPool.release(ctx);
			}
		}
	}
}
