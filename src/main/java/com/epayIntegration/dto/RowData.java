package com.epayIntegration.dto;

import lombok.Data;

@Data
public class RowData {
    public RowData(String id, String type, String value) {
        this.id = id;
        this.type = type;
        this.value = value;
        if (!type.equals("check")) {
            this.key = value;
        } else {
            this.key = "['']";
        }
    }

    public RowData(String id, String type, String value, String key) {
        this.id = id;
        this.type = type;
        this.value = value;
        this.key = key;
    }

    private String id;
    private String type;
    private String value;
    private String key;
}
