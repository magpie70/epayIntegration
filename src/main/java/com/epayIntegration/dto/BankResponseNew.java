package com.epayIntegration.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BankResponseNew {

    private String access_token;
    private BigDecimal expires_in;
    private String refresh_token;
    private String scope;
    private String token_type;
}
