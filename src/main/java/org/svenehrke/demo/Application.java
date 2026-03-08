package org.svenehrke.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.svenehrke.demo.web.AppConfigProperties;

@SpringBootApplication
@EnableConfigurationProperties(
	AppConfigProperties.class
)
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

}
