package com.epayIntegration.repo;

import com.epayIntegration.dto.BankRequest;
import com.epayIntegration.dto.BankResponseNew;
import feign.Headers;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@FeignClient(value = "payment", url = "${host.token}")
public interface FeignClientToken {

    @RequestMapping(method = RequestMethod.POST, path = "/oauth2/token", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Headers("Content-Type: application/json")
    ResponseEntity<BankResponseNew> getPaymentAuthToken(@RequestBody BankRequest body);
}
