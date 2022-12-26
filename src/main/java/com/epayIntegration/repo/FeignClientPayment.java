package com.epayIntegration.repo;

import com.epayIntegration.dto.BankRequest;
import com.epayIntegration.dto.BankResponseNew;
import com.epayIntegration.dto.FormData;
import feign.Headers;
import feign.Response;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@FeignClient(value = "payment", url = "${host.payment}")
public interface FeignClientPayment {

    @RequestMapping(method = RequestMethod.POST, path = "check-status/payment/transaction/:invoiceid", produces = MediaType.APPLICATION_JSON_VALUE)
    @Headers("Content-Type: application/json")
    ResponseEntity<BankResponseNew> getTransactionInfo(@RequestHeader("Authorization") String bearerToken, @RequestBody BankRequest body);


}
