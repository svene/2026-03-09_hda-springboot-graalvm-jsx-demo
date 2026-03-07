package org.svenehrke.demo.web;

import org.graalvm.polyglot.*;
import org.springframework.stereotype.Service;

@Service
public class JsxRenderer {

	private final Context context;

	public JsxRenderer() {
		context = Context.newBuilder("js")
			.allowAllAccess(true)
			.build();
	}

	public String renderUserPage(String name, int age) {

		String script = """
            const template = require('user.js');
            template.UserPage({ user: { name: '%s', age: %d } }).toString();
        """.formatted(name, age);

		return context.eval("js", script).asString();
	}
}
