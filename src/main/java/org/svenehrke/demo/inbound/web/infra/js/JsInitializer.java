package org.svenehrke.demo.inbound.web.infra.js;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Source;
import org.graalvm.polyglot.Value;

import java.io.IOException;
import java.io.Reader;

public class JsInitializer {
	private org.graalvm.polyglot.Context context;

	public JsInitializer(String rootFilename, Reader isr) throws IOException {
		Context ctx = Context.newBuilder("js").allowAllAccess(true).build();
		ctx.eval("js", """
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
			""");
		ctx.eval("js", "var module = {exports:{}}; var exports = module.exports;");

		var source = Source.newBuilder("js", isr, rootFilename).build();
		ctx.eval(source);

		context = ctx;
	}

	public Value getEntryFunction(String name) {
		var entryFunction = context.getBindings("js")
			.getMember("module")
			.getMember("exports")
			.getMember(name);
		if (!entryFunction.canExecute()) {
			throw new RuntimeException("'%s 'is undefined or not executable".formatted(name));
		}
		return entryFunction;
	}
}
