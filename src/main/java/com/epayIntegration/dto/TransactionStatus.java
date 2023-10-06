package com.epayIntegration.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransactionStatus {
    private String resultCode;
    private String resultMessage;
    private TransactionInfo transaction;
}
