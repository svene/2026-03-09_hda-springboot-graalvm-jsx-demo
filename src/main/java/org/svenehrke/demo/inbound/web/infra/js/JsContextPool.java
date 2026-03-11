package org.svenehrke.demo.inbound.web.infra.js;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.function.Supplier;

public class JsContextPool {

	private final BlockingQueue<JsInitializer> pool;
	private final Supplier<JsInitializer> factory;
    private final int size;

    public JsContextPool(int size, Supplier<JsInitializer> factory) {
        this.size = size;
		this.factory = factory;
        pool = new ArrayBlockingQueue<>(size);
    }

    public void init() {
		fillPool();
	}

    private void fillPool() {
		System.out.println("JsContextPool.fillPool");
		for (int i = 0; i < size; i++) {
            pool.offer(factory.get());
		}
	}

	public JsInitializer borrow() throws InterruptedException {
		return pool.take();
	}

	public void release(JsInitializer ctx) {
		pool.offer(ctx);
	}

    /**
     * Rebuilds all contexts in the pool.
     * Used when the JS bundle changes in development.
     */
    public synchronized void reset() {
        pool.clear();
        fillPool();
    }
}
