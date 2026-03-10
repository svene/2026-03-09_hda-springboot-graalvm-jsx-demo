package org.svenehrke.demo.core;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.svenehrke.demo.inbound.web.PersonDetailModel;
import org.svenehrke.demo.inbound.web.PersonEditModel;
import org.svenehrke.demo.inbound.web.PersonTableModel;
import org.svenehrke.demo.inbound.web.PersonTableRowModel;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class PeopleService {
    private final PeopleRepository peopleRepository;

	public PeopleService(PeopleRepository peopleRepository) {
		this.peopleRepository = peopleRepository;
	}

	public PersonTableModel personTableModel() {
        return peopleRepository.people();
    }

	public PersonTableModel peopleForSearch(String search) {
        return StringUtils.hasLength(search) ? peopleRepository.peopleForSearch(search) : peopleRepository.people();
    }

	public int total() {
        return peopleRepository.total();
    }

	public PersonTableRowModel personTableRowModel(int id) {
		return peopleRepository.personTableRowModel(id);
	}
	public PersonEditModel personEditModel(int id) {
		return peopleRepository.personEditModel(id);
	}

	public PersonDetailModel personDetailModel(int id) {
		return peopleRepository.personDetailModel(id);
	}

	@Transactional
	public int deleteByIds(List<Integer> ids) {
		return peopleRepository.deleteByIds(ids);
	}

	@Transactional
	public int updatePerson(int id, PersonEditModel personEditModel) {
		return peopleRepository.updatePerson(id, personEditModel);
	}

}
