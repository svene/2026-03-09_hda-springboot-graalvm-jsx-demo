package org.svenehrke.demo.inbound.web.infra.js;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.function.Supplier;

public class SimplePool<T> {

	private final Logger log = LoggerFactory.getLogger(SimplePool.class);
	private final BlockingQueue<T> pool;
	private final Supplier<T> factory;
	private final int size;
	private boolean initialized = false;

	public SimplePool(int size, Supplier<T> factory) {
		this.size = size;
		this.factory = factory;
		pool = new ArrayBlockingQueue<>(size);
	}

	private void fillPool() {
		log.info("filling pool");
		for (int i = 0; i < size; i++) {
			pool.offer(factory.get());
		}
	}

	public T borrow() throws InterruptedException {
		if (!initialized) {
			fillPool();
			initialized = true;
		}
		return pool.take();
	}

	public boolean release(T item) {
		return pool.offer(item);
	}

}
