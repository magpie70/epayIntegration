package com.epayIntegration.repo;

import com.epayIntegration.dto.FormData;
import feign.Headers;
import feign.Response;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@FeignClient(value = "sign", url = "${host.payment}")
public interface FeignClientPayment {

    @RequestMapping(method = RequestMethod.POST, path = "/oauth2/token", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Headers("Content-Type: application/json")
    Response saveTableData(@RequestHeader(value = "Authorization", required = true) String authorizationHeader, @RequestBody FormData body);
}
