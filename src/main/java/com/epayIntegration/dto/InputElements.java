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
    private BigDecimal amount;
    @JsonProperty(required = true)
    private String iin;
    @JsonProperty(required = true)
    private String mail;
    @JsonProperty(required = true)
    private String orderId;
    @JsonProperty(required = true)
    private String language;
    @JsonProperty(required = true)
    private String url;

    private String template;
    private String name;
    private String phoneNumber;

}
