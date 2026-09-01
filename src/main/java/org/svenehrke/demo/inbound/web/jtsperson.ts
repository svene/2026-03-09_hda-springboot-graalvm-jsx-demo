import {JTSPersonEventName} from "./generated/types/vm-types";

/** Java-HONO: JTSPersonEventName.java
 * guard function to be used in .ts components for code completion + a typecheck
 * of every event-name string against the Java-generated union
 */
export const eventName = (name: JTSPersonEventName): JTSPersonEventName => {
	return name
}
