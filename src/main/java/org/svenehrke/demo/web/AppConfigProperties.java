package org.svenehrke.demo.web;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app")
@Validated // TODO
public record AppConfigProperties(
	Ssr ssr
) {

	public record Ssr(
		String filename,
		String entryfunction
	){}

}
