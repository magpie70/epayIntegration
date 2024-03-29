package com.epayIntegration.service;


import com.epayIntegration.constants.MerchantConst;
import com.epayIntegration.dto.*;
import com.epayIntegration.kkbsign.KKBSign;
import com.epayIntegration.repo.FeignClientToken;
import com.epayIntegration.repo.FeignClientPayment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EpayService {

    private final FeignClientToken feignClientToken;
    private final FeignClientPayment feignClientPayment;

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

    public ResponseEntity<BankResponseNew> getTokenInfo(InputElements input) {
        BankRequest bankRequest = new BankRequest(input.getOrderId(), input.getAmount(), "");
        return feignClientToken.getPaymentAuthToken(bankRequest);
    }

    public ResponseEntity<TransactionStatus> getTransactionInfo(String authorization, String invoiceId) {
        return feignClientPayment.getTransactionInfo("Bearer " + authorization, invoiceId);
    }

    public ResponseEntity<TransactionResponse> getTransactionCharge(String authorization, String transactionId, Boolean charge) {
        if(Boolean.TRUE.equals(charge))
            return feignClientPayment.getTransactionCharge("Bearer " + authorization, transactionId);
        else
            return feignClientPayment.getTransactionRefund("Bearer " + authorization, transactionId);
    }

    public String getCheckOrder(String checkOrder) {

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
