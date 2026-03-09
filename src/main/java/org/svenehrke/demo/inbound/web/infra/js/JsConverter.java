package org.svenehrke.demo.inbound.web.infra.js;

import org.graalvm.polyglot.proxy.ProxyArray;
import org.graalvm.polyglot.proxy.ProxyObject;

import java.lang.reflect.RecordComponent;
import java.util.*;

public class JsConverter {

	public static Object toJs(Object obj) {
		if (obj == null) return null;

		// primitive types
		if (obj instanceof String ||
			obj instanceof Number ||
			obj instanceof Boolean)
			return obj;

		// enums
		if (obj instanceof Enum<?> e)
			return e.name();

		// lists
		if (obj instanceof List<?> list) {
			List<Object> converted = new ArrayList<>();
			for (Object o : list) {
				converted.add(toJs(o));
			}
			return ProxyArray.fromList(converted);
		}

		// maps
		if (obj instanceof Map<?, ?> map) {
			Map<String,Object> converted = new HashMap<>();
			for (var entry : map.entrySet()) {
				converted.put(entry.getKey().toString(), toJs(entry.getValue()));
			}
			return ProxyObject.fromMap(converted);
		}

		// records
		if (obj.getClass().isRecord()) {
			Map<String,Object> converted = new HashMap<>();

			for (RecordComponent rc : obj.getClass().getRecordComponents()) {
				try {
					Object value = rc.getAccessor().invoke(obj);
					converted.put(rc.getName(), toJs(value));
				} catch (Exception e) {
					throw new RuntimeException(e);
				}
			}

			return ProxyObject.fromMap(converted);
		}

		return obj;
	}
}
