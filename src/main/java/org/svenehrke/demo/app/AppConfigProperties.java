package org.svenehrke.demo.app;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app")
@Validated // TODO
public record AppConfigProperties(
	Ssr ssr
) {

	public record Ssr(
		Resource resource
	){}

}
