package org.svenehrke.demo.inbound.web.infra.js;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

@Service
public class JsxRenderer {

	private final Logger log = LoggerFactory.getLogger(JsxRenderer.class);
	private final JsonMapper jsonMapper;
	private final JsHolder jsHolder;


	public JsxRenderer(
		JsonMapper jsonMapper,
		JsHolder jsHolder
	) {
		this.jsonMapper = jsonMapper;
		this.jsHolder = jsHolder;
	}

	public String render(String route, Object vm) {
		log.info("rendering {}", route);
		JsConnection ctx = null;
		try {
			String vmJson = jsonMapper.writeValueAsString(vm);
			ctx = jsHolder.jsConnectionPoolSupplier().get().borrow();
			var result = ctx.getEntryFunction("render").execute(route, vmJson);
			return result.asString();
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new RuntimeException(e);
		}
		finally {
			log.info("finished rendering {}", route);
			if (ctx != null) {
				jsHolder.jsConnectionPoolSupplier().get().release(ctx);
			}
		}
	}

}
