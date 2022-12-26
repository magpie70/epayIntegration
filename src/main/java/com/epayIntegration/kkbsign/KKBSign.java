package com.epayIntegration.kkbsign;

import com.epayIntegration.constants.MerchantConst;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Base64;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.Serializable;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.Signature;

import com.epayIntegration.constants.MerchantConst;

@Component
@Slf4j
public class KKBSign implements Serializable {
    public synchronized String build64(String amount, String orderId) {
        try {
            Resource resource = new ClassPathResource("template.xml");
            FileInputStream fileInputStream = new FileInputStream(resource.getFile());
            byte[] arrayOfByte2 = new byte[fileInputStream.available()];
            fileInputStream.read(arrayOfByte2);
            String str11 = new String(arrayOfByte2);
            str11 = replace(str11, "%order_id%", orderId);
            str11 = replace(str11, "%amount%", amount);
            str11 = replace(str11, "%amount%", amount);
            str11 = replace(str11, "%certificate%", MerchantConst.CERTIFICATE);
            str11 = replace(str11, "%merchant_id%", MerchantConst.MERCHANT_ID);
            str11 = replace(str11, "%currency%", MerchantConst.CURRENCY);
            str11 = replace(str11, "%merchant_name%", MerchantConst.MERCHANT_NAME);
            String str12 = sign64(str11, MerchantConst.KEY_STORE);
            str11 = str11 + "<merchant_sign type=\"RSA\">" + str12 + "</merchant_sign>";
            str11 = "<document>" + str11 + "</document>";
            Base64 base64 = new Base64();
            log.info(str11);
            byte[] arrayOfByte3 = str11.getBytes();
            return new String(base64.encode(arrayOfByte3));
        } catch (Exception exception) {
            System.err.println("sign exception " + exception.toString());
            return new String("");
        }
    }

    public synchronized String sign64(String template, String keystorePass) {
        try {
            Base64 base64 = new Base64();
            byte[] arrayOfByte1 = template.getBytes();
            char[] arrayOfChar1 = MerchantConst.KEY_PASS.toCharArray();
            char[] arrayOfChar2 = MerchantConst.STORE_PASS.toCharArray();
            if (MerchantConst.DEBUG) {
                MessageDigest messageDigest = MessageDigest.getInstance(MerchantConst.DEBUG_HASH);
                byte[] arrayOfByte = messageDigest.digest(arrayOfByte1);
                log.info(MerchantConst.DEBUG_HASH + " Hash:");
                log.info(new String(base64.encode(arrayOfByte)));
            }
            KeyStore keyStore = KeyStore.getInstance(MerchantConst.KEY_STORE_TYPE);
            Resource resource = new ClassPathResource(keystorePass);
            FileInputStream fileInputStream = new FileInputStream(resource.getFile());
            keyStore.load(fileInputStream, arrayOfChar2);
            Signature signature = Signature.getInstance(MerchantConst.SIGN_ALGORITHM);
            PrivateKey privateKey = (PrivateKey) keyStore.getKey(MerchantConst.CERT_ALIAS, arrayOfChar1);
            signature.initSign(privateKey);
            signature.update(arrayOfByte1);
            byte[] arrayOfByte2 = signature.sign();
            if (MerchantConst.INVERT) {
                byte b = 0;
                for (int i = arrayOfByte2.length; b < i / 2; b++) {
                    byte b1 = arrayOfByte2[b];
                    arrayOfByte2[b] = arrayOfByte2[i - b - 1];
                    arrayOfByte2[i - b - 1] = b1;
                }
            }
            return new String(base64.encode(arrayOfByte2));
        } catch (Exception exception) {
            log.info("sign exception " + exception.toString());
            return exception.toString();
        }
    }

    public synchronized boolean verify(String text, String signature64) {
        try {
            Base64 base64 = new Base64();
            byte[] arrayOfByte1 = text.getBytes();
            byte[] arrayOfByte2 = base64.decode(signature64);
            char[] arrayOfChar = MerchantConst.STORE_PASS.toCharArray();
            KeyStore keystoreInst = KeyStore.getInstance(MerchantConst.KEY_STORE_TYPE);
            Resource resource = new ClassPathResource(MerchantConst.KEY_STORE);
            FileInputStream fileInputStream = new FileInputStream(resource.getFile());
            keystoreInst.load(fileInputStream, arrayOfChar);
            Signature signature = Signature.getInstance(MerchantConst.SIGN_ALGORITHM);
            signature.initVerify(keystoreInst.getCertificate(MerchantConst.VERIFY_ALIAS));
            signature.update(arrayOfByte1);
            if (MerchantConst.INVERT) {
                byte b = 0;
                for (int i = arrayOfByte2.length; b < i / 2; b++) {
                    byte b1 = arrayOfByte2[b];
                    arrayOfByte2[b] = arrayOfByte2[i - b - 1];
                    arrayOfByte2[i - b - 1] = b1;
                }
            }
            return signature.verify(arrayOfByte2);
        } catch (Exception exception) {
            System.err.println("verify exception " + exception.toString());
            return false;
        }
    }

    private String value(String paramString1, String paramString2) {
        int i = paramString1.indexOf(paramString2);
        i = paramString1.indexOf('"', i) + 1;
        int j = paramString1.indexOf('"', i);
        return paramString1.substring(i, j);
    }

    private String replace(String paramString1, String paramString2, String paramString3) {
        int i = paramString1.indexOf(paramString2);
        int j = i + paramString2.length();
        return paramString1.substring(0, i) + paramString3 + paramString1.substring(j);
    }
}

