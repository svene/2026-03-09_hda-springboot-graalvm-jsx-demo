package org.svenehrke.demo.inbound.web.infra.js;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.function.Supplier;

public class JsContextPool {

	private final BlockingQueue<JsInitializer> pool;
	private final Supplier<JsInitializer> factory;
	private final boolean devMode;

	public JsContextPool(int size, Supplier<JsInitializer> factory, boolean devMode) {
		this.factory = factory;
		this.devMode = devMode;
		this.pool = new ArrayBlockingQueue<>(size);

		for (int i = 0; i < size; i++) {
			pool.add(factory.get());
		}
	}

	public JsInitializer borrow() throws InterruptedException {

		if (devMode) {
			// recreate context every borrow in dev
			return factory.get();
		}

		return pool.take();
	}

	public void release(JsInitializer ctx) {

		if (devMode) {
			// dev contexts are disposable
			return;
		}

		pool.offer(ctx);
	}
}
