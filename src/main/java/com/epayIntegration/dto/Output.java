package com.epayIntegration.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.lang.Nullable;

@Data
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Output {

    private OutputBase64 base64Content;
    private String email;
    private String backLink;
    private String postLink;
    private String failureBackLink;
    private String language;

    @Nullable
    private String template;
    @Nullable
    private String name;
    @Nullable
    private String phoneNumber;

}
