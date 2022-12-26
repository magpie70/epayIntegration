package com.epayIntegration.controller;


import com.epayIntegration.dto.BankResponse;
import com.epayIntegration.dto.CheckOrder;
import com.epayIntegration.dto.IinInput;
import com.epayIntegration.dto.InputElements;
import com.epayIntegration.dto.Output;
import com.epayIntegration.service.EpayService;
import com.epayIntegration.service.SynergyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.Map;

@RestController
//@RequestMapping("api/")
@RequiredArgsConstructor
public class EpayController {

    private final EpayService epayService;
    private final SynergyService synergyService;


    // api/public/back-link
    @PostMapping("/api/get-output")
    public ResponseEntity<Output> getOutput(@RequestBody InputElements input) {
        return epayService.getOutput(input);
    }

    @GetMapping("/api/get-check-order")
    public String getCheckOrder(@RequestParam String checkOrder) {
        return epayService.getCheckOrder(checkOrder);
    }

    @GetMapping("/api/get-back-link")
    public ResponseEntity<String> getBackLink(@RequestParam IinInput iin) {
        HttpHeaders headers = new HttpHeaders();
        String url = epayService.getBackLink(iin);
        headers.setLocation(URI.create(url));
        return new ResponseEntity<>(headers, HttpStatus.MOVED_PERMANENTLY);
    }

    @PostMapping("/api/get-post-link")
    public String getPostLink(@RequestParam String dataUUID, @RequestBody BankResponse bankResponse) throws Exception {
        synergyService.saveInfoToSynergy(dataUUID, bankResponse.getResponse());
        return "0";
    }

    @GetMapping("/api/get-failure-back-link")
    public ResponseEntity<Void> getFailureBackLink(@RequestParam IinInput iin) {
        HttpHeaders headers = new HttpHeaders();
        String url = epayService.getFailureBackLink(iin);
        headers.setLocation(URI.create(url));
        return new ResponseEntity<>(headers, HttpStatus.MOVED_PERMANENTLY);
    }

}
