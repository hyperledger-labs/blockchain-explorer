/*
Copyright IBM Corp. 2018 All Rights Reserved.

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

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

var logger = shim.NewLogger("simpleChaincode")

// COLLECTION is local collection
const COLLECTION = "collectionSimple"

//    simpleChaincode allows the following transactions
//    "put", "key", val - returns "OK" on success
//    "get", "key" - returns val stored previously
//    "getPut", "key", val - gets a values if stored and returns "OK" on success
//    "getPrivate", "key" - returns private value stored previously
//    "putPrivate", "key" - returns val stored previously
//    "getPutPrivate", "key" - gets private value if stored and returns "OK" on success
type simpleChaincode struct {
}

//Init implements chaincode's Init interface
func (t *simpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	logger.Info("########### Init ###########")
	return shim.Success(nil)
}

//Invoke implements chaincode's Invoke interface
func (t *simpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	if function != "invoke" {
		logger.Error("Unknown function call")
		return shim.Error("Unknown function call")
	}
	if len(args) < 2 {
		logger.Errorf(fmt.Sprintf("invalid number of args %d", len(args)))
		return shim.Error(fmt.Sprintf("invalid number of args %d", len(args)))
	}
	method := args[0]
	logger.Infof(">>>>>>> Invoke method : %s ", method)
	switch method {

	case "get":
		return t.get(stub, args)

	case "put":
		if len(args) < 3 {
			logger.Errorf(fmt.Sprintf("invalid number of args for put %d", len(args)))
			return shim.Error(fmt.Sprintf("invalid number of args for put %d", len(args)))
		}
		return t.put(stub, args)

	case "getPut":
		if len(args) < 3 {
			logger.Errorf(fmt.Sprintf("invalid number of args for getPut %d", len(args)))
			return shim.Error(fmt.Sprintf("invalid number of args for getPut %d", len(args)))
		}
		return t.getPut(stub, args)

	case "getPrivate":
		return t.getPrivate(stub, args)

	case "putPrivate":
		if len(args) < 3 {
			logger.Errorf(fmt.Sprintf("invalid number of args for putPrivate %d", len(args)))
			return shim.Error(fmt.Sprintf("invalid number of args for putPrivate %d", len(args)))
		}
		return t.putPrivate(stub, args)

	case "getPutPrivate":
		if len(args) < 3 {
			logger.Errorf(fmt.Sprintf("invalid number of args for getPutPrivate %d", len(args)))
			return shim.Error(fmt.Sprintf("invalid number of args for getPutPrivate %d", len(args)))
		}
		return t.getPutPrivate(stub, args)

	default:
		return shim.Error(fmt.Sprintf("unknown function %s", method))
	}
}

func (t *simpleChaincode) put(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	err := stub.PutState(args[1], []byte(args[2]))
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success([]byte("OK"))
}

func (t *simpleChaincode) get(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// Get the state from the ledger
	val, err := stub.GetState(args[1])
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(val)
}

func (t *simpleChaincode) getPut(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// Get the state from the ledger
	_, err := stub.GetState(args[1])
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(args[1], []byte(args[2]))
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success([]byte("OK"))
}

func (t *simpleChaincode) putPrivate(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	err := stub.PutPrivateData(COLLECTION, args[1], []byte(args[2]))
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success([]byte("OK"))
}

func (t *simpleChaincode) getPrivate(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// Get the state from the private ledger
	val, err := stub.GetPrivateData(COLLECTION, args[1])
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(val)
}

func (t *simpleChaincode) getPutPrivate(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	// Get the state from the private ledger
	_, err := stub.GetPrivateData(COLLECTION, args[1])
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutPrivateData(COLLECTION, args[1], []byte(args[2]))
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success([]byte("OK"))
}

func main() {
	err := shim.Start(new(simpleChaincode))
	if err != nil {
		fmt.Printf("Error starting New key per invoke: %s", err)
	}
}
