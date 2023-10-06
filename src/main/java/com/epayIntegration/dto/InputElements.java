package com.epayIntegration.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class InputElements {

    @JsonProperty(required = true)
    private String amount;
    @JsonProperty(required = false)
    private String iin;
    @JsonProperty(required = false)
    private String mail;
    @JsonProperty(required = true)
    private String orderId;
    @JsonProperty(required = false)
    private String language;
    @JsonProperty(required = false)
    private String url;

    private String template;
    private String name;
    private String phoneNumber;

    public InputElements(String orderId, String amount) {
        this.orderId = orderId;
        this.amount = amount;
    }

}
