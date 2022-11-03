package com.epayIntegration.service;


import com.epayIntegration.dto.InputElements;
import com.epayIntegration.dto.Output;
import com.epayIntegration.dto.OutputBase64;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EpayService {

    @Value("${host}")
    private String url;
    private final String CERT_ID = "c183ec1a";
    private final String NAME = "RGKP NIIS KazPatent";
    private final String MERCHANT_ID = "98706001";
    private final String CURRENCY = "398";
    private final String MERCHANT_SIGN = "vX1RrQVqLGDEGmK275hUoMn2a4yHJKgPHroM4mB4zg2Q6o0628L8p+sqkYaMoMf1MW+T6JSdzVY30" +
            "miW2+uR5ifYBO2vOSWWMUE+nHtNc3goccjJPyuRUzbcLZJHthOjtA+C7rBJZ5awdnLHwxIjrK7J+czvdPMUYOEjx+s35F4=";
    private final String DONATE_ID = "98128485";

    public ResponseEntity<Output> getOutput(InputElements input) {

        String backLink = url + "api/get-back-link?iin=" + input.getIin();
        String failureBackLink = url + "api/get-post-link?iin=" + input.getIin();
        String postLink = url + "api/get-failure-back-link?iin=" + input.getIin();

        String email = input.getMail();
        String language = input.getLanguage();

        StringBuilder xmlBuilder = new StringBuilder();
        xmlBuilder.append("<document>");
        xmlBuilder.append("<merchant cert_id=\"" + CERT_ID + "\" name=\"RGKP NIIS KazPatent\">");
        xmlBuilder.append("<order order_id=\"" + input.getOrderId() + "\" amount=\"" + input.getAmount() +
                "\" currency=\"" + CURRENCY + "398\">");
        xmlBuilder.append("<department merchant_id=\"" + MERCHANT_ID +
                "\" donate_id=\"" + DONATE_ID + "\" amount=\"" + input.getAmount() + "\"/>");
        xmlBuilder.append("</order>");
        xmlBuilder.append("</merchant>");
        xmlBuilder.append("<merchant_sign type=\"RSA\">/" + MERCHANT_SIGN + "</merchant_sign>");
        xmlBuilder.append("</document>");

        OutputBase64 base64Content = getOutputBase64(xmlBuilder.toString());

        Output mainData = new Output(base64Content, email, backLink, postLink, failureBackLink,
                language, input.getTemplate(), input.getName(), input.getPhoneNumber());

        return ResponseEntity.accepted().body(mainData);
    }

    private OutputBase64 getOutputBase64(String inputXML) {
        Base64 base64 = new Base64();
        String encodedString = new String(base64.encode(inputXML.getBytes()));
        OutputBase64 outputBase64 = new OutputBase64(encodedString);
        return outputBase64;
    }

    public ResponseEntity<String> getBackLink(String iin) {
//        OutputFailure link = new OutputFailure(input.getUrl() + "/" + iin + "/back-link");
//        if (input.getIin() == null) {
//            return ResponseEntity.notFound().build();
//        }
        return ResponseEntity.accepted().body("Платеж отменен: " + iin);
    }

    public ResponseEntity<String> getPostLink(String iin) {
//        OutputFailure link = new OutputFailure(input.getUrl() + "/" + iin + "/post-link");
//        if (input.getIin() == null) {
//            return ResponseEntity.notFound().build();
//        }
        return ResponseEntity.accepted().body("Платеж успешно совершен: " + iin);
    }

    public ResponseEntity<String> getFailureBackLink(String iin) {
//        OutputFailure link = new OutputFailure(input.getUrl() + "/" + iin + "/failure-back-link");
//        if (input.getIin() == null) {
//            return ResponseEntity.notFound().build();
//        }
        return ResponseEntity.accepted().body("Платеж не прошел: " + iin);
    }
}
