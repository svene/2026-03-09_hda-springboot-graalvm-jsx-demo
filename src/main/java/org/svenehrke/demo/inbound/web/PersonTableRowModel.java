package org.svenehrke.demo.inbound.web;

public record PersonTableRowModel(
    int id,
    String firstName,
    String lastName,
    String streetName
) {}
