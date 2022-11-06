package com.epayIntegration.kkbsign;

import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.Serializable;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.Signature;

@Component
public class KKBSign implements Serializable {
    public String keystoretype = new String("JKS");

    public String signalgorythm = new String("SHA1withRSA");

    public boolean invert = true;

    public boolean debug = false;

    public String debughash = new String("SHA");

    private static final String keystore = "test.jks";
    private static final String alias = "cert";
    private static final String keypass = "nissan";
    private static final String storepass = "nissan";
    private static final String certificate = "00C182B189";
    private static final String merchantId = "92061101";
    private static final String currency = "398";
    private static final String merchantName = "test shop";

    public synchronized String build64(String amount, String orderId) {
        try {
            File file = ResourceUtils.getFile(
                    "classpath:template.xml");
            FileInputStream fileInputStream2 = new FileInputStream(file);
            byte[] arrayOfByte2 = new byte[fileInputStream2.available()];
            fileInputStream2.read(arrayOfByte2);
            String str11 = new String(arrayOfByte2);
            str11 = replace(str11, "%order_id%", orderId);
            str11 = replace(str11, "%amount%", amount);
            str11 = replace(str11, "%amount%", amount);
            str11 = replace(str11, "%certificate%", certificate);
            str11 = replace(str11, "%merchant_id%", merchantId);
            str11 = replace(str11, "%currency%", currency);
            str11 = replace(str11, "%merchant_name%", merchantName);
            String str12 = sign64(str11, keystore);
            str11 = str11 + "<merchant_sign type=\"RSA\">" + str12 + "</merchant_sign>";
            str11 = "<document>" + str11 + "</document>";
            Base64 base64 = new Base64();
            System.out.println(str11);
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
            char[] arrayOfChar1 = keypass.toCharArray();
            char[] arrayOfChar2 = storepass.toCharArray();
            if (this.debug) {
                MessageDigest messageDigest = MessageDigest.getInstance(this.debughash);
                byte[] arrayOfByte = messageDigest.digest(arrayOfByte1);
                System.out.println(this.debughash + " Hash:");
                System.out.println(new String(base64.encode(arrayOfByte)));
            }
            KeyStore keyStore = KeyStore.getInstance(this.keystoretype);
            File file = ResourceUtils.getFile(
                    "classpath:" + keystorePass);
            FileInputStream fileInputStream = new FileInputStream(file);
            keyStore.load(fileInputStream, arrayOfChar2);
            Signature signature = Signature.getInstance(this.signalgorythm);
            PrivateKey privateKey = (PrivateKey) keyStore.getKey(alias, arrayOfChar1);
            signature.initSign(privateKey);
            signature.update(arrayOfByte1);
            byte[] arrayOfByte2 = signature.sign();
            if (this.invert) {
                byte b = 0;
                for (int i = arrayOfByte2.length; b < i / 2; b++) {
                    byte b1 = arrayOfByte2[b];
                    arrayOfByte2[b] = arrayOfByte2[i - b - 1];
                    arrayOfByte2[i - b - 1] = b1;
                }
            }
            return new String(base64.encode(arrayOfByte2));
        } catch (Exception exception) {
            System.err.println("sign exception " + exception.toString());
            return new String("");
        }
    }

    public synchronized boolean verify(String paramString1, String paramString2, String paramString3, String paramString4, String paramString5) {
        try {
            Base64 base64 = new Base64();
            byte[] arrayOfByte1 = paramString1.getBytes();
            byte[] arrayOfByte2 = (byte[]) base64.decode(paramString2.toCharArray());
            char[] arrayOfChar = paramString5.toCharArray();
            KeyStore keyStore = KeyStore.getInstance(this.keystoretype);
            FileInputStream fileInputStream = new FileInputStream(paramString3);
            keyStore.load(fileInputStream, arrayOfChar);
            Signature signature = Signature.getInstance(this.signalgorythm);
            signature.initVerify(keyStore.getCertificate(paramString4));
            signature.update(arrayOfByte1);
            if (this.invert) {
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

    public String getKeystoretype() {
        return this.keystoretype;
    }

    public void setKeystoretype(String paramString) {
        this.keystoretype = paramString;
    }

    public String getSignalgorythm() {
        return this.signalgorythm;
    }

    public void setSignalgorythm(String paramString) {
        this.signalgorythm = paramString;
    }

    public boolean getInvert() {
        return this.invert;
    }

    public void setInvert(boolean paramBoolean) {
        this.invert = paramBoolean;
    }

    public boolean getDebug() {
        return this.debug;
    }

    public void setDebug(boolean paramBoolean) {
        this.debug = paramBoolean;
    }

    public String getDebughash() {
        return this.debughash;
    }

    public void setDebughash(String paramString) {
        this.debughash = paramString;
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

