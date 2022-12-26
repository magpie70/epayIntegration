package com.epayIntegration.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class FormData {
    private String uuid;
    private List<RowData> data;

    public FormData(String uuid) {
        this.uuid = uuid;
        this.data = new ArrayList<>();
    }
}
