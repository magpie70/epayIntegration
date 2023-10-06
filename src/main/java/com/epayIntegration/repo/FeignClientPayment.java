package com.epayIntegration.repo;

import com.epayIntegration.dto.*;
import feign.Headers;
import feign.Response;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(value = "payment", url = "${host.payment}")
public interface FeignClientPayment {

    @RequestMapping(method = RequestMethod.GET, path = "check-status/payment/transaction/{invoiceId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Headers("Content-Type: application/json")
    ResponseEntity<TransactionStatus> getTransactionInfo(@RequestHeader("Authorization") String bearerToken, @PathVariable("invoiceId") String invoiceId);

    @RequestMapping(method = RequestMethod.POST, path = "operation/{id}/charge", produces = MediaType.APPLICATION_JSON_VALUE)
    @Headers("Content-Type: application/json")
    ResponseEntity<TransactionResponse> getTransactionCharge(@RequestHeader("Authorization") String bearerToken, @PathVariable("id") String id);

    @RequestMapping(method = RequestMethod.POST, path = "operation/{id}/refund", produces = MediaType.APPLICATION_JSON_VALUE)
    @Headers("Content-Type: application/json")
    ResponseEntity<TransactionResponse> getTransactionRefund(@RequestHeader("Authorization") String bearerToken, @PathVariable("id") String id);

}
