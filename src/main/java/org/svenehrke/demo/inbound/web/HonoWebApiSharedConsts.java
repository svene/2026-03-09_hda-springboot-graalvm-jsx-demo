package org.svenehrke.demo.inbound.web;

/**
 * Source of truth for the two mutation endpoint path templates — used in
 * {@link PersonActionController}'s {@code @PutMapping} / {@code @DeleteMapping}
 * (compile-time constants) and, on the frontend, generated into
 * {@code generated/types/web-api-consts.ts} by the gmavenplus script in pom.xml.
 */
public interface HonoWebApiSharedConsts {

    interface HonoWebApiConsts {
        String PERSON = "/person/{id}";
        String DELETE = "/delete";
    }
}
