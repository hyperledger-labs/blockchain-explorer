/*
Copyright IBM Corp., DTCC All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/
package org.hyperledger.fabric.example;

import org.hyperledger.fabric.shim.ChaincodeBase;
import org.hyperledger.fabric.shim.ChaincodeStub;

import javax.crypto.*;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

import static java.nio.charset.StandardCharsets.UTF_8;

public class SampleCC extends ChaincodeBase {

    private static final int AESKeyLength = 32; // AESKeyLength is the default AES key length - java by default support only 128 bit keys

    @Override
    public Response init(ChaincodeStub stub) {
        return newSuccessResponse();
    }

    @Override
    public Response invoke(ChaincodeStub stub) {
        String func = stub.getFunction();
        List<String> params = stub.getParameters();
        if (!"invoke".equals(func)) {
            return newErrorResponse("Unknown function call");
        }
        if (params.size() < 2) {
            return newErrorResponse("invalid number of args " + params.size());
        }
        String method = params.get(0);
        if ("put".equals(method)) {
            if (params.size() < 3) {
                return newErrorResponse("invalid number of args for put " + params.size());
            }
            return writeTransaction(stub, params);
        } else if ("get".equals(method)) {
            return readTransaction(stub, params);
        } else {
            return newErrorResponse("unknown function " + method);
        }
    }

    private Response readTransaction(ChaincodeStub stub, List<String> params) {
        try {
            byte[] val = stub.getState(params.get(1));
            return newSuccessResponse(val);
        } catch (Exception e) {
            return newErrorResponse(e);
        }
    }

    private Response writeTransaction(ChaincodeStub stub, List<String> params) {
        try {
            byte[] cryptoArg = encryptAndDecrypt(params.get(2));
            stub.putState(params.get(1), cryptoArg);
            return newSuccessResponse("OK".getBytes(UTF_8));
        } catch (Exception e) {
            return newErrorResponse(e);
        }
    }

    private byte[] encryptAndDecrypt(String s) throws NoSuchPaddingException, InvalidKeyException, NoSuchAlgorithmException, IllegalBlockSizeException, BadPaddingException, InvalidAlgorithmParameterException {
        SecretKey key = genAESKey(AESKeyLength);
        byte[] iv = genInitVector();
        String enc = encrypt(key, s, iv);
        return decrypt(key, enc, iv);
    }

    private String encrypt(SecretKey key, String value, byte[] ivBytes) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException {
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(ivBytes));
        byte[] encrypted = cipher.doFinal(value.getBytes());
        return Base64.getEncoder().encodeToString(encrypted);
    }

    private byte[] decrypt(SecretKey key, String strToDecrypt, byte[] ivBytes) throws InvalidAlgorithmParameterException, InvalidKeyException, NoSuchPaddingException, NoSuchAlgorithmException, BadPaddingException, IllegalBlockSizeException {
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(ivBytes));
        return cipher.doFinal(Base64.getDecoder().decode(strToDecrypt));
    }

    private SecretKey genAESKey(int keyLength) {
        SecureRandom secureRandom = new SecureRandom();
        byte[] key = new byte[keyLength];
        secureRandom.nextBytes(key);
        return new SecretKeySpec(key, "AES");
    }

    private byte[] genInitVector() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] iv = new byte[16];
        secureRandom.nextBytes(iv);
        return iv;
    }

    public static void main(String[] args) {
        new SampleCC().start(args);
    }
}
