/*
#
# copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#
*/

package main

import (
	"bytes"
	"encoding/gob"
	"fmt"
	"github.com/golang/protobuf/proto"
	"github.com/hyperledger/fabric/common/tools/protolator"
	"github.com/hyperledger/fabric/protos/msp"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

// ===================================================================================
// Main
// ===================================================================================
func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}

// Init initializes chaincode
// ===========================
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

// Invoke - Our entry point for Invocations
// ========================================
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {

	fmt.Println("\n\nex02 Invoke")

	fmt.Printf("Begin*** GetArgs \n")
	//check for getArgs and getSttringArgs
	args_take1 := stub.GetArgs()

	for key, currArg := range args_take1 {
		fmt.Printf("args_take1[%d] := %s\n", key, string(currArg))
	}
	fmt.Printf("End*** GetArgs \n\n")

	fmt.Printf("Begin*** GetStringArgs \n")
	params := stub.GetStringArgs()
	fmt.Printf("args_take2 := %s \n", params)
	fmt.Printf("End*** GetStringArgs \n\n")

	fmt.Printf("Begin*** GetArgsSlice \n")
	argsSlice, err := stub.GetArgsSlice()
	if err != nil {
		fmt.Printf("Error in argsSlice := %v \n", err)
	}

	if err == nil {
		fmt.Printf("argsSlice := %v \n", string(argsSlice))
	}
	fmt.Printf("End*** GetArgsSlice\n\n")

	fmt.Printf("Begin*** GetFunctionAndParameters \n")
	function, args := stub.GetFunctionAndParameters()
	fmt.Printf("function := %s, args := %s \n", function, args)
	fmt.Printf("End*** GetFunctionAndParameters\n\n")

	// Handle different functions
	if function == "getTxTimeStamp" {
		return t.getTxTimeStamp(stub)
	} else if function == "getCreator" {
		return t.getCreator(stub)
	} else if function == "getBinding" {
		return t.getBinding(stub)
	} else if function == "getSignedProposal" {
		return t.getSignedProposal(stub)
	} else if function == "getTransient" {
		return t.getTransient(stub)
	}

	fmt.Println("invoke did not find func: " + function) //error
	return shim.Error("Received unknown function invocation")
}

//===================================================================================================
// functon getCreator
// You can verify by calling getCreator during initMarble and checking fot the value
// during a transferMarble say
//===================================================================================================

func (t *SimpleChaincode) getCreator(stub shim.ChaincodeStubInterface) pb.Response {

	fmt.Printf("\nBegin*** getCreator \n")
	creator, err := stub.GetCreator()
	if err != nil {
		fmt.Printf("GetCreator Error")
		return shim.Error(err.Error())
	}

	si := &msp.SerializedIdentity{}
	err2 := proto.Unmarshal(creator, si)
	if err2 != nil {
		fmt.Printf("Proto Unmarshal Error")
		return shim.Error(err2.Error())
	}
	buf := &bytes.Buffer{}
	protolator.DeepMarshalJSON(buf, si)
	fmt.Printf("End*** getCreator \n")
	fmt.Printf(string(buf.Bytes()))

	return shim.Success([]byte(buf.Bytes()))
}

//===================================================================================================
// functon to getBinding
//===================================================================================================
func (t *SimpleChaincode) getBinding(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Printf("\nBegin*** getBinding \n")
	binding, err := stub.GetBinding()
	if err != nil {
		fmt.Printf("Returning error ****************** ")
		return shim.Error(err.Error())
	} else if binding == nil {
		fmt.Printf("###### No Transaction Binding is generated ###### ")
		return shim.Error("###### No Transaction Binding is generated ###### ")
	}
	fmt.Printf("\t returned value from stub : %v\n", binding)
	fmt.Printf("End*** getBinding \n")
	return shim.Success(binding)
}

//===================================================================================================
// functon to getTxTimestamp
// in the time that is associated with current invoke on channel
//===================================================================================================
func (t *SimpleChaincode) getTxTimeStamp(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Printf("\nBegin*** getTxTimeStamp \n")
	txTimeAsPtr, err := stub.GetTxTimestamp()
	if err != nil {
		fmt.Printf("Returning error ******************\n")
		return shim.Error(err.Error())
	}
	fmt.Printf("\t returned value from stub: %v\n", txTimeAsPtr)
	fmt.Printf("\t After converting time to Unix format %s \n", time.Unix(txTimeAsPtr.Seconds, int64(txTimeAsPtr.Nanos)).String())
	fmt.Printf("\nEnd*** getTxTimeStamp \n")
	//return shim.Success([]byte(txTimeAsPtr))
	return shim.Success(nil)
}

//===================================================================================================
// functon to getTransient
// got to pass these variables during invoke in a transient map
// these values are not stored on ledger
//===================================================================================================
func (t *SimpleChaincode) getTransient(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Printf("\nBegin*** getTransient \n")
	payload, err := stub.GetTransient()
	fmt.Printf(" payload from chaincode : %v", payload)
	if err != nil {
		return shim.Error(err.Error())
	}
	for key, currArg := range payload {
		fmt.Printf("Inside ... Loop")
		fmt.Printf("payload[%d] := %s\n", key, currArg)
	}
	b, err2 := GetBytes(payload)
	if err2 != nil {
		return shim.Error(err2.Error())
	}
	fmt.Printf("\nEnd*** getTransient \n")
	return shim.Success([]byte(b))
}

//===================================================================================================
// functon to getSignedProposal
//===================================================================================================
func (t *SimpleChaincode) getSignedProposal(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Printf("\nBegin*** getSignedProposal \n")
	signedProposal, err := stub.GetSignedProposal()
	if err != nil {
		fmt.Printf("Returning error ****************** ")
		return shim.Error(err.Error())
	}
	fmt.Printf("\t returned value from stub: %v", signedProposal)
	fmt.Printf("\nEnd*** getSignedProposal \n")
	buf := &bytes.Buffer{}
	protolator.DeepMarshalJSON(buf, signedProposal)
	fmt.Printf(string(buf.Bytes()))
	return shim.Success([]byte(buf.Bytes()))
}

func GetBytes(key interface{}) ([]byte, error) {
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	err := enc.Encode(key)
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
