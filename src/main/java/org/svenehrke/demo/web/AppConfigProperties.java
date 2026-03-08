package org.svenehrke.demo.web;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app.ssr")
@Validated // TODO
public record AppConfigProperties(
	/*@NotBlank */String entryfunction
) {
}
