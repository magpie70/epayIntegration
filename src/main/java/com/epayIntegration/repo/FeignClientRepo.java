package com.epayIntegration.repo;

import com.epayIntegration.dto.DocumentInput;
import feign.Response;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(value = "sign", url = "http://localhost:8080")
public interface FeignClientRepo {

    // request to get Output
    @GetMapping(value = "/api/get-output")
    Response getOutput(@RequestParam("input") DocumentInput input);

}
