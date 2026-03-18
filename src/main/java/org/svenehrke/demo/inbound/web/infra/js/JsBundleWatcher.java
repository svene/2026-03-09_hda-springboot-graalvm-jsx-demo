package org.svenehrke.demo.inbound.web.infra.js;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.svenehrke.demo.app.AppConfigProperties;
import org.svenehrke.demo.app.RuntimeEnvironment;

import java.io.IOException;
import java.nio.file.*;

@Component
public class JsBundleWatcher {

	private final Logger log = LoggerFactory.getLogger(JsBundleWatcher.class);
    private final RuntimeEnvironment runtimeEnvironment;
	private final Resource resource;
    private final JsHolder jsHolder;

	private WatchService watchService;
	private Thread watchThread;

    public JsBundleWatcher(
        RuntimeEnvironment runtimeEnvironment,
        AppConfigProperties appConfigProperties,
		JsHolder jsHolder
	) {
        this.runtimeEnvironment = runtimeEnvironment;
        resource = appConfigProperties.ssr().resource();
		this.jsHolder = jsHolder;
	}

	@PostConstruct
	public void start() throws IOException {
		log.info("Starting JsBundleWatcher");

        if (!runtimeEnvironment.isDevMode()) {
            return;
        }

		Path file = resource.getFile().toPath();
		Path dir = file.getParent();

		watchService = FileSystems.getDefault().newWatchService();

		dir.register(
			watchService,
			StandardWatchEventKinds.ENTRY_MODIFY,
			StandardWatchEventKinds.ENTRY_CREATE
		);

		watchThread = new Thread(this::watchLoop, "js-bundle-watcher");
		watchThread.setDaemon(true);
		watchThread.start();
	}

	private void watchLoop() {
		Path fileName;
		try {
			fileName = resource.getFile().toPath().getFileName();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}

		while (!Thread.currentThread().isInterrupted()) {
			WatchKey key;
			try {
				key = watchService.take();
			}
			catch (InterruptedException e) {
				return;
			}
			for (WatchEvent<?> event : key.pollEvents()) {
				Path changed = (Path) event.context();
				if (changed.equals(fileName)) {
                    log.info("calling initpool");
					jsHolder.initPool();
				} else {
					log.info("NOT calling initpool");
				}
			}
			key.reset();
		}
	}

	@PreDestroy
	public void stop() throws IOException {
		if (watchService != null) {
			watchService.close();
		}
		if (watchThread != null) {
			watchThread.interrupt();
		}
	}
}
