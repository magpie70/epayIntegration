package com.epayIntegration.service;


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

    @Value("${host}")
    private String url;
    private final String CERT_ID = "c183ec1a";   // done
    private final String NAME = "RGKP NIIS KazPatent"; // done
    private final String MERCHANT_ID = "98706001";  // done
    private final String CURRENCY = "398";          // done
    private final String MERCHANT_SIGN = "vX1RrQVqLGDEGmK275hUoMn2a4yHJKgPHroM4mB4zg2Q6o0628L8p+sqkYaMoMf1MW+T6JSdzVY30" +
            "miW2+uR5ifYBO2vOSWWMUE+nHtNc3goccjJPyuRUzbcLZJHthOjtA+C7rBJZ5awdnLHwxIjrK7J+czvdPMUYOEjx+s35F4=";
    private final String DONATE_ID = "98128485";

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

    public String getBackLink(IinInput iin) {

        return "https://google.com";
    }

    public String getPostLink(IinInput iin) {

        return "https://google.com";
    }

    public String getFailureBackLink(IinInput iin) {

        return "https://google.com";
    }

}
