/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

// This chaincode demonstrates the following ChaincodeStubInterface APIs
// More details can be obtained from the following link:
// https://github.com/hyperledger/fabric-chaincode-node/blob/master/src/lib/stub.js
//
// getArgs -- arguments intended for the chaincode Init and Invoke
//            as an array of byte arrays
// getStringArgs -- arguments intended for the chaincode Init and
//                 Invoke as a string array
// getFunctionAndParameters -- returns the first argument as the function
//                             name and the rest of the arguments as parameters
//                             in a string array
// getTxID -- the Transaction ID of the transaction proposal
// invokeChaincode -- call the specified chaincode `Invoke` using the
//                     same transaction context
// getCreator -- returns `SignatureHeader.Creator` (e.g. an identity)
//               of the `SignedProposal`
// getTransient -- It is a map that contains data (e.g. cryptographic material)
//                that might be used to implement some form of application-level
//                confidentiality.
// getBinding -- returns the transaction binding
// getSignedProposal -- returns the SignedProposal object, which contains all
//                      data elements part of a transaction proposal
// getTxTimestamp -- returns the timestamp when the transaction was created
//                   This is extracted from transaction ChannelHeader
// setEvent -- If the transaction is validated and successfully committed,
//             the event will be delivered to the current event listeners

const shim = require('fabric-shim');
const util = require('util');
const path = require('path');

var Chaincode = class {

  // Initialize the chaincode
  async Init(stub) {
    let fileName = __filename.slice(__filename.lastIndexOf(path.sep)+1, __filename.length -3);
    console.info('========= Instantiated chaincode '+fileName+' =========');
    return shim.success();
  }

  // Invoke, to update or query the ledger in a proposal transaction.
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    let method = this[ret.fcn];
    if (!method) {
      console.log('no method of name:' + ret.fcn + ' found');
      return shim.success();
    }
    try {
      let payload = await method(stub, this, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  // ========================================================
  // Input Sanitation - input checking, look for empty strings
  // ========================================================
  sanitizeArgs(args, count) {
    if (args.length != count){
      throw new Error('Incorrect number of arguments. Expecting '+count);
    }
  	for (let i=0;i<args.length;i++) {
  		if (!args[i]) {
  			throw new Error(args[i]+ ' must be a non-empty string');
  		}
  	}
  }

  //GetArgs returns the arguments intended for the chaincode Init and Invoke
	// as an array of byte arrays
  async getArgs(stub, thisClass) {
    console.info('\n---------- getArgs ----------');
    let args = stub.getArgs();
    console.log(args);
    thisClass.sanitizeArgs(args, 4);
    let A = args[1];
    let B = args[2];
    let C = args[3];
    return Buffer.from(A +' '+B+' '+C);
  }

  async getStringArgs(stub, thisClass) {
    console.info('\n---------- getStringArgs ----------');
    let args = stub.getStringArgs();
    console.log(args);
    thisClass.sanitizeArgs(args, 4);
    let A = args[1];
    let B = args[2];
    let C = args[3];
    return Buffer.from(A +' '+B+' '+C);
  }

  async getFunctionAndParameters(stub, thisClass) {
    console.info('\n---------- getFunctionAndParameters ----------');
    let ret = stub.getFunctionAndParameters();
    let args = ret.params;
    console.log(args);
    thisClass.sanitizeArgs(args, 3);
    let A = args[0];
    let B = args[1];
    let C = args[2];
    return Buffer.from(ret.fcn + ' '+A +' '+B+' '+C);
  }

  async getTxID(stub) {
    console.info('\n---------- getTxID ----------');
    let txId = stub.getTxID();
    console.info(txId);
    return Buffer.from(txId);
  }

  async invokeChaincode(stub, thisClass, args) {
    console.info('\n---------- invokeChaincode ----------');
    thisClass.sanitizeArgs(args, 3);
    let chaincodeName = args[0];
    let ccArgs = [];
    ccArgs.push(args[1]);
    ccArgs.push(args[2]);
    let channel = '';
    let response = await stub.invokeChaincode(chaincodeName, ccArgs, channel);
    console.log(response);
    if (response.status != 200){
      throw new Error('Failed calling chaincode '+chaincodeName);
    } else {
      console.log(response.payload.buffer.toString());
      //TODO: Parse the response
      return Buffer.from(response.payload.buffer.toString());
    }
  }

  async getCreator(stub) {
    console.info('\n---------- getCreator ----------');
    let creator = stub.getCreator();
    console.log(creator);
    return Buffer.from(creator.mspid);
  }

  async getTransient(stub, thisClass, args) {
    console.info('\n---------- getTransient ----------');
    let transientMap = stub.getTransient();
    console.log(transientMap);
    //TODO: Parse transientMap and send it
    return Buffer.from('');
  }

  //TODO: what do we want to verify for this API in Behave
  async getBinding(stub) {
    console.info('\n---------- getBinding ----------');
    let binding = stub.getBinding();
    console.log(binding);
    return Buffer.from(binding.toString());
  }

  //TODO: what do we want to verify for this API in Behave
  async getSignedProposal(stub){
    console.info('\n---------- getSignedProposal ----------');
    let signedProposal = stub.getSignedProposal();
    console.log(signedProposal);
    //TODO: Parse signedProposal
    return Buffer.from(signedProposal.toString());
  }

  //TODO: FAB-6417 - This has to be fixed to make this work
  async getTxTimestamp(stub){
    console.info('\n---------- getTxTimestamp ----------');
    let timestamp = stub.getTxTimestamp();
    console.log(timestamp);
    return Buffer.from(timestamp);
  }

  //TODO: can test this when there is even handling on the client side
  async setEvent(stub, thisClass, args){
    console.info('\n---------- setEvent ----------');
    thisClass.sanitizeArgs(args, 2);
    let name = args[0];
    let payload = args[1];
    stub.setEvent(name, payload);
  }
};

shim.start(new Chaincode());
