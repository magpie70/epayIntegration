package com.epayIntegration.service;

import com.epayIntegration.dto.BankResponseNew;
import com.epayIntegration.dto.FormData;
import com.epayIntegration.dto.InputElements;
import com.epayIntegration.dto.RowData;
import com.epayIntegration.dto.TransactionStatus;
import com.epayIntegration.kkbsign.KKBSign;
import com.epayIntegration.repo.FeignClientRepo;
import feign.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SynergyService {

    public static int PRETTY_PRINT_INDENT_FACTOR = 4;
    private final FeignClientRepo feignClientRepo;
    private final EpayService feignClientPayment;
    private static final Logger LOGGER = LoggerFactory.getLogger(SynergyService.class);

    private final EpayService epayService;
    @Value("${host}")
    private String synergyHost;


    private String getAuthorization() {
        return "Basic ZGV2X2RldjoxMjM0NTY=";
    }

    public void saveInfoToSynergy(String dataUUID, String response) throws Exception {
        FormData formData = new FormData(dataUUID);

        JSONObject xmlJSONObj = xmlToJson(response);

        Boolean isVerified = verifyBankXmlSign(xmlJSONObj);
        formData.getData().add(createRowDataInfo("textarea-response", "textarea",
                xmlJSONObj.toString(PRETTY_PRINT_INDENT_FACTOR), null));

        formData.getData().add(createRowDataInfo("status_pay", "listbox", "Проведен", "3"));
        Response synergyResp = feignClientRepo.saveTableData(getAuthorization(), formData);

    }

    private RowData createRowDataInfo(String id, String type, String value, String key) {
        return key == null ? new RowData(id, type, value) : new RowData(id, type, value, key);
    }

    private JSONObject xmlToJson(String xml) {
        try {
            JSONObject xmlJSONObj = XML.toJSONObject(xml);
            String jsonPrettyPrintString = xmlJSONObj.toString(PRETTY_PRINT_INDENT_FACTOR);
            log.info(jsonPrettyPrintString);
            return xmlJSONObj;
        } catch (JSONException je) {
            log.error(je.toString());
        }
        return null;
    }

    public Boolean verifyBankXmlSign(JSONObject xmlJSONObj) throws Exception {
        JSONObject document = xmlJSONObj.optJSONObject("document");

        if (document == null) {
            log.error("document is null ");
            throw new Exception("document is null");
        }

        JSONObject bank_sign = document.optJSONObject("bank_sign");
        String sign = bank_sign.optString("content");

        KKBSign kkbSign = new KKBSign();
        document.remove("bank_sign");
        Boolean isVerified = kkbSign.verify(document.toString(), sign);

        return isVerified;
    }

    public void getDataExtByRegistryCode(String registryCode) {
        // Build the URI for the REST API endpoint
        URI uri = UriComponentsBuilder
                .fromUriString(synergyHost + "/rest/api/registry/data_ext")
                .queryParam("registryCode", registryCode)
                .queryParam("loadData", true)
                .queryParam("field", "status_pay1")
                .queryParam("condition", "CONTAINS")
                .queryParam("key", 1)
                .queryParam("field", "status_pay1")
                .queryParam("condition", "CONTAINS")
                .queryParam("key", 4)
                .queryParam("term", "or")
                .queryParam("fields", "status_pay1")
                .queryParam("fields", "numeric_input_sum")
                .queryParam("fields", "counter_pay")

                .build()
                .toUri();

        // Call the REST API endpoint using the FeignClientRepo interface
        Response response = feignClientRepo.getDataExt(getAuthorization(), uri);

        checkIsThereIsRightStatus(getDataResults(parseFeignToJsonObject(response)));
    }


    public JSONObject parseFeignToJsonObject(Response response) {
        JSONObject result;
        try (BufferedReader buffer = new BufferedReader(new InputStreamReader(response.body().asInputStream()))) {
            String resp = buffer.lines().collect(Collectors.joining("\n"));
            result = new JSONObject(resp);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to process response body.", ex);
        }
        if (response != null) {
            response.close();
        }
        return result;
    }

    public JSONArray getDataResults(JSONObject data) {
        int count = data.optInt("recordsCount");
        if (count < 1)
            return new JSONArray();
        return data.optJSONArray("result");
    }

    private void checkIsThereIsRightStatus(JSONArray jsonArray) {
        for (int i = 0; i < jsonArray.length(); i++) {
            JSONObject jsonObject = jsonArray.optJSONObject(i);
            if (jsonObject != null) {
                JSONObject fieldValues = jsonObject.optJSONObject("fieldValue");
                JSONObject fieldKeys = jsonObject.optJSONObject("fieldKey");

                String invoiceId = fieldValues.optString("counter_pay");
                String status = fieldKeys.optString("status_pay1");
                String sum = fieldKeys.optString("numeric_input_sum");

                if (invoiceId != null && status != null && sum != null)
                    log.info("invoiceId: " + invoiceId + " status: " + status + " sum: " + sum);

                BankResponseNew bankResponseNew = epayService.getTokenInfo(new InputElements(invoiceId, sum)).getBody();

                if (bankResponseNew != null && bankResponseNew.getAccess_token() != null) {
                    log.info("token for invoiceId " + invoiceId + ", is:" + bankResponseNew.getAccess_token());
                    ResponseEntity<TransactionStatus> transactionStatus = feignClientPayment.getTransactionInfo(bankResponseNew.getAccess_token(), invoiceId);

                    transactionStatus.getStatusCode();
                }
            }
        }
    }

}
