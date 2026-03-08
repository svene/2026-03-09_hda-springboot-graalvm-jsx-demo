package org.svenehrke.demo.web;

import org.graalvm.polyglot.proxy.ProxyObject;

import java.lang.reflect.RecordComponent;
import java.util.HashMap;
import java.util.Map;

public class JsConverter {

	public static Object toJs(Object obj) {
		if (obj == null) return null;

		if (obj.getClass().isRecord()) {
			Map<String, Object> map = new HashMap<>();

			for (RecordComponent rc : obj.getClass().getRecordComponents()) {
				try {
					Object value = rc.getAccessor().invoke(obj);
					map.put(rc.getName(), toJs(value)); // recursive
				} catch (Exception e) {
					throw new RuntimeException(e);
				}
			}

			return ProxyObject.fromMap(map);
		}

		return obj;
	}
}
