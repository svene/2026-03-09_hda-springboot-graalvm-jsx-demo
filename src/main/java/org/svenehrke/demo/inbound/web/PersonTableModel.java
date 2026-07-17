package org.svenehrke.demo.inbound.web;
import java.util.List;

public record PersonTableModel(
    List<PersonTableRowModel> people,
    int total
) {}
