package org.svenehrke.demo.inbound.web.infra.js;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Engine;
import org.graalvm.polyglot.Source;
import org.graalvm.polyglot.Value;

import java.util.HashMap;
import java.util.Map;

public class JsConnection {

    private final Map<String, Value> entryFunctions = new HashMap<>();

	public JsConnection(Engine engine, Source source) {
		Context ctx = Context.newBuilder("js")
			.engine(engine)
			.allowAllAccess(true)
			.build();

		ctx.eval("js", TEXT_ENCODER);
		ctx.eval("js", "var module = {exports:{}}; var exports = module.exports;");
		ctx.eval(source);

        // Resolve exports once
        Value exports = ctx.getBindings("js")
            .getMember("module")
            .getMember("exports");

        for (String key : exports.getMemberKeys()) {
            Value member = exports.getMember(key);
            if (member.canExecute()) {
                entryFunctions.put(key, member);
            }
        }
	}

	public Value getEntryFunction(String name) {
        Value fn = entryFunctions.get(name);
        if (fn == null) {
            throw new RuntimeException("JS function '%s' not found".formatted(name));
		}
        return fn;
	}
	private static final String TEXT_ENCODER = """
			class TextEncoder {
			  encode(str) {
				// Convert string to UTF-8 bytes
				const bytes = [];
				for (let i = 0; i < str.length; i++) {
				  const code = str.charCodeAt(i);
				  if (code < 0x80) {
					bytes.push(code);
				  } else if (code < 0x800) {
					bytes.push(0xc0 | (code >> 6));
					bytes.push(0x80 | (code & 0x3f));
				  } else {
					bytes.push(0xe0 | (code >> 12));
					bytes.push(0x80 | ((code >> 6) & 0x3f));
					bytes.push(0x80 | (code & 0x3f));
				  }
				}
				return Uint8Array.from(bytes);
			  }
			}
			""";
}
