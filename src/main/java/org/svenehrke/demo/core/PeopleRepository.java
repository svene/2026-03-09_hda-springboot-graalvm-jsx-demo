package org.svenehrke.demo.core;

import org.svenehrke.demo.inbound.web.PersonDetailModel;
import org.svenehrke.demo.inbound.web.PersonEditModel;
import org.svenehrke.demo.inbound.web.PersonTableModel;
import org.svenehrke.demo.inbound.web.PersonTableRowModel;

import java.util.List;

public interface PeopleRepository {
    PersonTableModel people();
    PersonTableModel peopleForSearch(String search);
    int total();
    PersonTableRowModel personTableRowModel(int id);
    PersonEditModel personEditModel(int id);
    PersonDetailModel personDetailModel(int id);
    int deleteByIds(List<Integer> ids);
    int updatePerson(int id, PersonEditModel personEditModel);
}
