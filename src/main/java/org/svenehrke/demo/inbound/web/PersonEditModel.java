package org.svenehrke.demo.inbound.web;

public record PersonEditModel(
    int id,
    String firstName,
    String lastName,
    String streetName
) {}
