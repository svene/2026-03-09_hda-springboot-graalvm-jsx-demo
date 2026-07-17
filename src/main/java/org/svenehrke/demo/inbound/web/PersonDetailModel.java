package org.svenehrke.demo.inbound.web;

public record PersonDetailModel(
    int id,
    String firstName,
    String lastName,
    String streetName,
    String streetNo,
    String zipCode,
    String city,
    String country,
    String mailBox,
    String phoneNumber,
    String cellPhone
) {}
