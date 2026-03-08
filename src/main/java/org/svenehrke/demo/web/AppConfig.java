package org.svenehrke.demo.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AppConfig {
	private final String activeProfile;
	private final boolean isDevMode;

	public AppConfig(
		@Value("${spring.profiles.active:}") String activeProfile
	) {
		this.activeProfile = activeProfile;
		this.isDevMode = activeProfile.contains("dev");
	}

	public boolean isDevMode() {
		return isDevMode;
	}

}
