package com.epayIntegration.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
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
        this.client_id = "test";
        this.client_secret = "yF587AV9Ms94qN2QShFzVR3vFnWkhjbAK3sG";
        this.invoiceID = invoiceID;
        this.amount = amount;
        this.currency = " KZT";
        this.terminal = "67e34d63-102f-4bd1-898e-370781d0074d";
        this.postLink = postLink;
        this.failurePostLink = postLink;
    }
}
