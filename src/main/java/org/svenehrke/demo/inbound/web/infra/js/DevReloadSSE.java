package org.svenehrke.demo.inbound.web.infra.js;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@Profile("dev")
public class DevReloadSSE {

	private static final Logger log = LoggerFactory.getLogger(DevReloadSSE.class);

	private final Set<SseEmitter> clients = ConcurrentHashMap.newKeySet();

	@GetMapping("/dev-reload")
	public SseEmitter stream() {
		SseEmitter emitter = new SseEmitter(0L); // no timeout
		clients.add(emitter);

		emitter.onCompletion(() -> clients.remove(emitter));
		emitter.onTimeout(() -> clients.remove(emitter));
		emitter.onError(e -> clients.remove(emitter));

		try {
			emitter.send(SseEmitter.event().name("connected").data("ok"));
		}
		catch (IOException e) {
			clients.remove(emitter);
		}

		return emitter;
	}

	public void broadcastReload() {
		clients.forEach(emitter -> {
			try {
				emitter.send(SseEmitter.event().name("reload").data("now"));
			}
			catch (Exception e) {
				emitter.complete();
				clients.remove(emitter);
			}
		});
	}
}
