package com.epayIntegration.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.lang.Nullable;

@Data
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Output {

    @JsonProperty("Signed_Order_B64")
    private String signedOrderB64Template;
    @JsonProperty("email")
    private String email;
    @JsonProperty("BackLink")
    private String backLink;
    @JsonProperty("PostLink")
    private String postLink;
    @JsonProperty("FailureBackLink")
    private String failureBackLink;
    @JsonProperty("Language")
    private String language;

    @Nullable
    private String template;
    @Nullable
    private String name;
    @Nullable
    private String phoneNumber;

}
