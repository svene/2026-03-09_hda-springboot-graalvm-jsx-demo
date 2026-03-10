package org.svenehrke.demo.outbound.db;

import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.svenehrke.demo.core.PeopleRepository;
import org.svenehrke.demo.inbound.web.*;

import java.util.List;

@Repository
@Primary
public class HSQLPeopleRepository implements PeopleRepository {

	private final JdbcClient jdbcClient;
	private final JdbcTemplate jdbcTemplate;

	public HSQLPeopleRepository(
		JdbcClient jdbcClient,
		JdbcTemplate jdbcTemplate
	) {
		this.jdbcClient = jdbcClient;
		this.jdbcTemplate = jdbcTemplate;
	}

	@Override
	public PersonTableModel people() {
		var sql = "select id, firstname, lastname, streetname from Person limit 20";
		List<PersonTableRowModel> result = jdbcClient.sql(sql).query(
			(rs, rowNum) -> new PersonTableRowModel(
				rs.getInt("id"),
				rs.getString("firstname"),
				rs.getString("lastname"),
				rs.getString("streetname")
		)).list();
		return new PersonTableModel(result, total());
	}

	@Override
	public PersonTableModel peopleForSearch(String search) {
		var sql = """
			select id, firstname, lastname, streetname
			from Person
			where
				firstname like (:search)
				or lastname like (:search)
				or streetname like (:search)
			limit 20
			""";
		List<PersonTableRowModel> result = jdbcClient.sql(sql)
			.param("search", "%" + search + "%")
			.query(
			(rs, rowNum) -> new PersonTableRowModel(
				rs.getInt("id"),
				rs.getString("firstname"),
				rs.getString("lastname"),
				rs.getString("streetname")
			)).list();
		return new PersonTableModel(result, total());
	}

	@Override
	public int total() {
		Integer count = jdbcTemplate.queryForObject(
			"SELECT COUNT(*) FROM Person",
			Integer.class
		);
		return count == null ? 0 : count;
	}

	@Override
	public PersonTableRowModel personTableRowModel(int id) {
		var sql = "select id, firstname, lastname, streetname from Person where id = ?";
		PersonTableRowModel result = jdbcClient.sql(sql)
			.param(id)
			.query(
			(rs, rowNum) -> new PersonTableRowModel(
				rs.getInt("id"),
				rs.getString("firstname"),
				rs.getString("lastname"),
				rs.getString("streetname")
			)).single();
		return result;
	}

	@Override
	public PersonEditModel personEditModel(int id) {
		var sql = "select id, firstname, lastname, streetname from Person where id = ?";
		return jdbcClient.sql(sql)
			.param(id)
			.query(
				(rs, rowNum) -> new PersonEditModel(
					rs.getInt("id"),
					rs.getString("firstname"),
					rs.getString("lastname"),
					rs.getString("streetname")
				)).single();
	}

	@Override
	public PersonDetailModel personDetailModel(int id) {
		var sql = """
			select
				id, firstname, lastname, streetname, streetno, zipcode, city,
			    country, mailbox, phonenumber, cellphone
			from Person
			where id = ?
			""";
		PersonDetailModel result = jdbcClient.sql(sql)
			.param(id)
			.query(
			(rs, rowNum) -> new PersonDetailModel(
				rs.getInt("id"),
				rs.getString("firstname"),
				rs.getString("lastname"),
				rs.getString("streetname"),
				rs.getString("streetno"),
				rs.getString("zipcode"),
				rs.getString("city"),
				rs.getString("country"),
				rs.getString("mailbox"),
				rs.getString("phonenumber"),
				rs.getString("cellphone")
			)
		).single();
		return result;
	}

	@Override
	public int deleteByIds(List<Integer> ids) {
		var sql = "delete from Person where id in (:ids)";
		return jdbcClient.sql(sql).param("ids", ids).update();
	}

	@Override
	public int updatePerson(int id, PersonEditModel personEditModel) {
		var sql = "update Person set firstname = (:firstname), lastname = (:lastname), streetname = (:streetname) where id = (:id)";
		return jdbcClient.sql(sql)
			.param("firstname", personEditModel.firstName())
			.param("lastname", personEditModel.lastName())
			.param("streetname", personEditModel.streetName())
			.param("id", id)
			.update();
	}

}
