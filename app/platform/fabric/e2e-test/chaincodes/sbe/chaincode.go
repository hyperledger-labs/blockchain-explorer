/*
Copyright IBM Corp. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/core/chaincode/shim/ext/statebased"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// Record is JSON-marshaled as a return value of getRecord
type Record struct {
	Key   string
	Value []byte
	Orgs  []string
}

/*
  EndorsementCC provides the following chaincode API:
    -) updateRecordValue(key, val) sets the value for a given key
       there is no return value on success
    -) updateRecordEP(key, org1, org2, ..., orgN) sets the endorsement policy for a given key
       the endorsement policy is represented by a list of MSP IDs
       there is no return value on success
    -) getRecord(key) returns a JSON-marshaled Record for the given key
*/
type EndorsementCC struct {
}

// Init callback
func (cc *EndorsementCC) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

// Invoke dispatcher
func (cc *EndorsementCC) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	funcName, _ := stub.GetFunctionAndParameters()
	if function, ok := functions[funcName]; ok {
		return function(stub)
	}
	return shim.Error(fmt.Sprintf("Unknown function %s", funcName))
}

// function dispatch map used by Invoke()
var functions = map[string]func(stub shim.ChaincodeStubInterface) pb.Response{
	"updateRecordVal": updateRecordValue,
	"updateRecordEP":  updateRecordEP,
	"getRecord":       getRecord,
}

func updateRecordEP(stub shim.ChaincodeStubInterface) pb.Response {
	_, parameters := stub.GetFunctionAndParameters()
	if len(parameters) < 2 {
		return shim.Error("Wrong number of arguments supplied.")
	}

	// set the EP
	err := setEP(stub, parameters[0], parameters[1:]...)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success([]byte{})
}

func updateRecordValue(stub shim.ChaincodeStubInterface) pb.Response {
	_, parameters := stub.GetFunctionAndParameters()
	if len(parameters) != 2 {
		return shim.Error("Wrong number of arguments supplied.")
	}

	// set the value
	err := stub.PutState(parameters[0], []byte(parameters[1]))
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success([]byte{})
}

func setEP(stub shim.ChaincodeStubInterface, key string, orgs ...string) error {
	ep, err := statebased.NewStateEP(nil)
	if err != nil {
		return err
	}
	// add organizations to endorsement policy
	err = ep.AddOrgs(statebased.RoleTypePeer, orgs...)
	if err != nil {
		return err
	}
	epBytes, err := ep.Policy()
	if err != nil {
		return err
	}
	// set the endorsement policy for the key
	err = stub.SetStateValidationParameter(key, epBytes)
	if err != nil {
		return err
	}
	return nil
}

func getRecord(stub shim.ChaincodeStubInterface) pb.Response {
	_, parameters := stub.GetFunctionAndParameters()
	if len(parameters) != 1 {
		return shim.Error("Wrong number of arguments supplied.")
	}
	key := parameters[0]

	// get the endorsement policy for the key
	epBytes, err := stub.GetStateValidationParameter(key)
	if err != nil {
		return shim.Error(err.Error())
	}
	ep, err := statebased.NewStateEP(epBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// get the value of the key
	val, err := stub.GetState(key)
	if err != nil {
		return shim.Error(err.Error())
	}

	// put it into the json
	r := &Record{
		Key:   key,
		Value: val,
		Orgs:  ep.ListOrgs(),
	}
	rBytes, err := json.Marshal(r)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(rBytes)
}

func main() {
	err := shim.Start(new(EndorsementCC))
	if err != nil {
		fmt.Printf("Error starting new cc: %s", err)
	}
}