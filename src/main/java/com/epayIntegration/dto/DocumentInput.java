package com.epayIntegration.dto;

import lombok.Data;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
@XmlRootElement(name = "document")
@XmlAccessorType(XmlAccessType.FIELD)
public class DocumentInput implements Serializable {

    @XmlElement
    private Merchant merchant;
    @XmlElement
    private MerchantSign merchantSign;

    @Data
    @XmlRootElement(name = "merchant")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class Merchant implements Serializable {

        @XmlElement
        private Order order;

        @Data
        @XmlRootElement(name = "order")
        @XmlAccessorType(XmlAccessType.FIELD)
        public static class Order implements Serializable {

            @XmlElement(name = "order_id")
            private String orderId;
            @XmlElement(name = "amount")
            private BigDecimal amount;
            @XmlElement(name = "currency")
            private String currency;
            @XmlElement
            private Department department;

            @Data
            @XmlRootElement(name = "department")
            @XmlAccessorType(XmlAccessType.FIELD)
            public static class Department implements Serializable {
                @XmlElement(name = "merchant_id")
                private String merchantId;
                @XmlElement(name = "donate_id")
                private String donateId;
                @XmlElement(name = "amount")
                private BigDecimal amount;
            }
        }

    }

    @Data
    @XmlRootElement(name = "merchant_sign")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class MerchantSign implements Serializable {
        @XmlElement(name = "type")
        private String type;
    }
}
