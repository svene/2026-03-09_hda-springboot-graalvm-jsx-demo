package org.svenehrke.demo.inbound.web.infra.js;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.svenehrke.demo.app.AppConfigProperties;

@Component
@Profile("dev") // only active in dev
public class JsBundleWatcher {

	private static final Logger log = LoggerFactory.getLogger(JsBundleWatcher.class);

	private final Resource resource;
	private final JsHolder jsHolder;

	private long lastModified = -1;

	public JsBundleWatcher(
		AppConfigProperties appConfigProperties,
		JsHolder jsHolder
	) {
		resource = appConfigProperties.ssr().resource();
		this.jsHolder = jsHolder;
	}

	@Scheduled(fixedDelay = 500) // every 1 second
	public void checkFile() throws Exception {
		var file = resource.getFile();
		if (!file.exists()) {
			return;
		}

		long current = file.lastModified();

		if (current != lastModified) {
			lastModified = current;
			log.info("SSR bundle changed → reloading");
			jsHolder.initPool();
		}
	}
}
