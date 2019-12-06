/*
Copyright IBM Corp. 2016 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// EventSender example simple Chaincode implementation
type EventSender struct {
}

// Init function
func (t *EventSender) Init(stub shim.ChaincodeStubInterface) pb.Response {
	err := stub.PutState("noevents", []byte("0"))
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// Invoke function
func (t *EventSender) invoke(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	b, err := stub.GetState("noevents")
	if err != nil {
		return shim.Error("Failed to get state")
	}
	noevts, _ := strconv.Atoi(string(b))

	tosend := "Event " + string(b)
	for _, s := range args {
		tosend = tosend + "," + s
	}

	err = stub.PutState("noevents", []byte(strconv.Itoa(noevts+1)))
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.SetEvent("evtsender", []byte(tosend))
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(nil)
}

// Query function
func (t *EventSender) query(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	b, err := stub.GetState("noevents")
	if err != nil {
		return shim.Error("Failed to get state")
	}
	jsonResp := "{\"NoEvents\":\"" + string(b) + "\"}"
	return shim.Success([]byte(jsonResp))
}

func (t *EventSender) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	if function == "invoke" {
		return t.invoke(stub, args)
	} else if function == "query" {
		return t.query(stub, args)
	}

	return shim.Error("Invalid invoke function name. Expecting \"invoke\" \"query\"")
}

func main() {
	err := shim.Start(new(EventSender))
	if err != nil {
		fmt.Printf("Error starting EventSender chaincode: %s", err)
	}
}
