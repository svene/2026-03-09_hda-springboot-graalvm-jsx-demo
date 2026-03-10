package org.svenehrke.demo.outbound.db;

import jakarta.annotation.PostConstruct;
import net.datafaker.Faker;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

@Component
public class DBInitializer {
	private final JdbcTemplate jdbcTemplate;

	public DBInitializer(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@PostConstruct
	@Transactional
	public void init() {
		System.out.println("DBInitializer.init");
		Integer count = jdbcTemplate.queryForObject(
			"SELECT COUNT(*) FROM Person",
			Integer.class
		);

		if (count != null && count > 0) {
			return;
		}

		Faker faker = new Faker(new Random(0));
		var name = faker.name();
		var address = faker.address();
		var phone = faker.phoneNumber();
		System.out.println("loading initial data...");
		for (int i = 0; i < 150; i++) {
			jdbcTemplate.update("""
					INSERT INTO
					Person(firstname, lastname,
					       streetname, streetno, zipcode, city, country,
					       mailbox, phonenumber, cellphone)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					""",
				name.firstName(), name.lastName(), address.streetName(), address.streetAddressNumber(),
				address.zipCode(), address.city(), address.country(),
				address.mailBox(),
				phone.phoneNumber(), phone.cellPhone()
			);
		}
	}
}
