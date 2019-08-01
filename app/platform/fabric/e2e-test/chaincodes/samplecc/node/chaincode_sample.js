/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/
'use strict';
const shim = require('fabric-shim');
const util = require('util');
const secureRandom = require('secure-random');
const aesjs = require('aes-js');

const AESKeyLength = 32 // AESKeyLength is the default AES key length
const NonceSize = 24 // NonceSize is the default NonceSize

// This Chaincode allows the following transactions
//    "put", "key", val - returns success response
//    "get", "key" - returns val stored previously

let Chaincode = class {
    async Init(stub) {
        console.info('=========== Sample Chaincode Instantiation Successfull !! ===========');
        return shim.success();
    }

    async Invoke(stub) {
        let ret = stub.getFunctionAndParameters();
        console.info(util.format('Args: %j', ret.params));
        let args = ret.params;
        let method = this[args[0]];
        if (!method) {
            console.log('no function of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
            let payload = await method(stub, ret.params, this);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    async encrypt(key, text) {
        let textBytes = aesjs.utils.utf8.toBytes(text);

        // The counter is optional, and if omitted will begin at 1
        let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        let encryptedBytes = aesCtr.encrypt(textBytes);

        // To print or store the binary data, you may convert it to hex
        let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
        return encryptedHex;
    }

    async decrypt(key, cipherText) {
        // When ready to decrypt the hex string, convert it back to bytes
        let encryptedBytes = aesjs.utils.hex.toBytes(cipherText);

        let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        let decryptedBytes = aesCtr.decrypt(encryptedBytes);

        // Convert our bytes back into text
        let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
        return decryptedText;
    }

    // To make the process busy, We just Encrypt and then decrypt the value
    async encryptAndDecrypt(arg, thisClass) {
        //Generate random AES key of length AESKeyLength
        let key = secureRandom.randomBuffer(AESKeyLength);
        let method = thisClass['encrypt'];
        let cipherText = await method(key, arg);
        method = thisClass['decrypt'];
        let plainText = await method(key, cipherText);
        return Buffer.from(plainText, 'utf8');
    }

    async put(stub, args, thisClass) {
        if (args.length != 3) {
            return shim.error(util.format('Invalid number of args for \'put\', %j', args.length));
        }
        let method = thisClass['encryptAndDecrypt'];
        let cryptoArg = await method(args[2], thisClass);
        await stub.putState(args[1], cryptoArg);
        return Buffer.from('OK', 'utf8');
    }

    async get(stub, args) {
        if (args.length != 2) {
            return shim.error(util.format('Invalid number of args for \'get\', %j', args.length));
        }
        // Get the state from the ledger
        let payload = await stub.getState(args[1]);

        if (!payload.toString()) {
            let jsonResp = {};
            jsonResp.error = args[1] + ' doesn\'t exist';
            throw new Error(jsonResp);
        }
        console.log(args[1] + ' : ' + payload.toString());
        return payload;
    }
};
shim.start(new Chaincode());
