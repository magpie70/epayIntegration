package com.epayIntegration.service;

import com.epayIntegration.dto.FormData;
import com.epayIntegration.dto.RowData;
import com.epayIntegration.kkbsign.KKBSign;
import com.epayIntegration.repo.FeignClientRepo;
import feign.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SynergyService {

    public static int PRETTY_PRINT_INDENT_FACTOR = 4;
    private final FeignClientRepo feignClientRepo;
    private static final Logger LOGGER = LoggerFactory.getLogger(SynergyService.class);

    private String getAuthorization() {
        return "Basic YWRtaW5fdG06YWRtaW5fdG0=";
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

}
