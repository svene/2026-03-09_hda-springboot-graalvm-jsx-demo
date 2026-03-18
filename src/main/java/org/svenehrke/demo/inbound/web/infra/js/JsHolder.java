package org.svenehrke.demo.inbound.web.infra.js;

import jakarta.annotation.PostConstruct;
import org.graalvm.polyglot.Engine;
import org.graalvm.polyglot.Source;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.svenehrke.demo.app.AppConfigProperties;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.function.Supplier;

@Component
public class JsHolder {
	private final Logger log = LoggerFactory.getLogger(JsHolder.class);
	private final Engine engine;
	private final AppConfigProperties appConfig;
	private SimplePool<JsConnection> jsConnectionPool;

	public JsHolder(AppConfigProperties appConfig) {
		this.appConfig = appConfig;
		engine = Engine.create();
	}

	public void initPool() {
		log.info("initializing pool");
		jsConnectionPool = buildPool();
	}

	private SimplePool<JsConnection> buildPool() {
		var source = buildSource();
		return new SimplePool<>(
			Runtime.getRuntime().availableProcessors(),
			() -> new JsConnection(engine, source)
		);
	}

	public Supplier<SimplePool<JsConnection>> jsConnectionPoolSupplier() {
		if (jsConnectionPool == null) {
			jsConnectionPool = buildPool();
		}
		return () -> jsConnectionPool;
	}

	/**
	 * Reloads the JS bundle and rebuilds the pool.
	 * Called by JsBundleWatcher when the file changes.
	 */
	public synchronized Source buildSource() {
		try {
			log.info("Reloading JS-Code");
			String code = new String(
				appConfig.ssr().resource().getInputStream().readAllBytes(),
				StandardCharsets.UTF_8
			);
			return Source.newBuilder("js", code, appConfig.ssr().resource().getFilename()).build();
		}
		catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	@PostConstruct
	public void init() {
	}
}
