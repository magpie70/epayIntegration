package com.epayIntegration.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data

public class BankRequest {

    private String grant_type;
    private String scope;
    private String client_id;
    private String client_secret;
    private String invoiceID;
    private String amount;
    private String currency;
    private String terminal;
    private String postLink;
    private String failurePostLink;

    public BankRequest(String invoiceID, String amount, String postLink){
        this.grant_type = "client_credentials";
        this.scope = "webapi usermanagement email_send verification statement statistics payment";
        this.client_id = "KAZPATENT.KZ";
        this.client_secret = "kH(bt1(rmuQxVDt";
        this.invoiceID = invoiceID;
        this.amount = amount;
        this.currency = "KZT";
        this.terminal = "936cc0a6-10ad-48e2-b524-be41383cfc2e";
        this.postLink = postLink;
        this.failurePostLink = postLink;
    }
}
