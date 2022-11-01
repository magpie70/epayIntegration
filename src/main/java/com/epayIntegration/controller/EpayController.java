package com.epayIntegration.controller;


import com.epayIntegration.dto.InputElements;
import com.epayIntegration.dto.Link;
import com.epayIntegration.dto.Output;
import com.epayIntegration.service.EpayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
//@RequestMapping("api/")
@RequiredArgsConstructor
public class EpayController {

    private final EpayService epayService;


    // api/public/back-link
    @GetMapping("/api/get-output")
    public ResponseEntity<Output> getOutput(@RequestBody InputElements input) {
        return epayService.getOutput(input);
    }

    @GetMapping("/api/get-back-link")
    public ResponseEntity<Link> getBackLink(@RequestBody InputElements input) {
        return epayService.getBackLink(input);
    }

    @GetMapping("/api/get-post-link")
    public ResponseEntity<Link> getPostLink(@RequestBody InputElements input) {
        return epayService.getPostLink(input);
    }

    @GetMapping("/api/get-failure-back-link")
    public ResponseEntity<Link> getFailureBackLink(@RequestBody InputElements input) {
        return epayService.getFailureBackLink(input);
    }

}
