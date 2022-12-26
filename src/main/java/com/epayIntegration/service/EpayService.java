package com.epayIntegration.service;


import com.epayIntegration.constants.MerchantConst;
import com.epayIntegration.dto.CheckOrder;
import com.epayIntegration.kkbsign.KKBSign;
import com.epayIntegration.dto.IinInput;
import com.epayIntegration.dto.InputElements;
import com.epayIntegration.dto.Output;
import com.epayIntegration.dto.OutputBase64;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EpayService {
    public ResponseEntity<Output> getOutput(InputElements input) {

        String backLink = input.getUrl() + "api/get-back-link?iin=" + input.getIin();
        String postLink = input.getUrl() + "api/get-post-link?iin=" + input.getIin();
        String failureBackLink = input.getUrl() + "api/get-failure-back-link?iin=" + input.getIin();

        String email = input.getMail();
        String language = input.getLanguage();

        KKBSign kkbSign = new KKBSign();

        String base64Content = kkbSign.build64(input.getAmount(), input.getOrderId());

        Output mainData = new Output(base64Content, email, backLink, postLink, failureBackLink,
                language, input.getTemplate(), input.getName(), input.getPhoneNumber());

        return ResponseEntity.accepted().body(mainData);
    }

    public String getCheckOrder(String checkOrder){

        KKBSign kkbSign = new KKBSign();

        String base64Content = kkbSign.sign64("<merchant id=\"92061101\"><order id=\"000091\"/></merchant>", MerchantConst.KEY_STORE);

        return base64Content;
    }

    public String getBackLink(IinInput iin) {

        return "https://google.com";
    }

    public String getFailureBackLink(IinInput iin) {

        return "https://google.com";
    }

}
