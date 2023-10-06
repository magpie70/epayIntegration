package com.epayIntegration.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransactionInfo {

    private UUID id;
    private String createdDate;
    private String invoiceID;
    private String amount;
    private String amountBonus;
    private String payoutAmount;
    private String cardType;
    private String currency;
    private String terminal;
    private String accountID;
    private String description;
    private String language;
    private String cardMask;
    private String issuer;
    private Boolean secure;
    private String statusID;
    private String statusName;
    private String name;
    private String email;
    private String phone;
    private String cardID;
}
