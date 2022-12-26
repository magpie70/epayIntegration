package com.epayIntegration.repo;

import com.epayIntegration.dto.DocumentInput;
import com.epayIntegration.dto.FormData;
import feign.Headers;
import feign.Response;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@FeignClient(value = "sign", url = "${host}")
public interface FeignClientRepo {

    @GetMapping("")
    ResponseEntity<Void> getAuth(@RequestHeader("Authorization") String Token, URI baseUrl);

    @RequestMapping(method = RequestMethod.POST, path = "/rest/api/asforms/data/merge", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Headers("Content-Type: application/json")
    Response saveTableData(@RequestHeader(value = "Authorization", required = true) String authorizationHeader, @RequestBody FormData body);

}
