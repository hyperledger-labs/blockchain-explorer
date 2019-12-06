// +build experimental

/*
Copyright IBM Corp. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// This chaincode implements a simple map that is stored in the state.
// The following operations are available.

// Invoke operations
// put - requires two arguments, a key and value
// remove - requires a key
// get - requires one argument, a key, and returns a value
// keys - requires no arguments, returns all keys

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

// Init is a no-op
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

// Invoke has two functions
// put - takes two arguments, a key and value, and stores them in the state
// remove - takes one argument, a key, and removes if from the state
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	switch function {

	case "putPrivate":
		if len(args) < 3 {
			return shim.Error("put operation on private data must include three arguments: [collection, key, value]")
		}
		collection := args[0]
		key := args[1]
		value := args[2]

		if err := stub.PutPrivateData(collection, key, []byte(value)); err != nil {
			fmt.Printf("Error putting private data%s", err)
			return shim.Error(fmt.Sprintf("put operation failed. Error updating state: %s", err))
		}

		return shim.Success(nil)

	case "removePrivate":
		if len(args) < 2 {
			return shim.Error("remove operation on private data must include two arguments: [collection, key]")
		}
		collection := args[0]
		key := args[1]

		err := stub.DelPrivateData(collection, key)
		if err != nil {
			return shim.Error(fmt.Sprintf("remove operation on private data failed. Error updating state: %s", err))
		}
		return shim.Success(nil)

	case "getPrivate":
		if len(args) < 2 {
			return shim.Error("get operation on private data must include two arguments: [collection, key]")
		}
		collection := args[0]
		key := args[1]
		value, err := stub.GetPrivateData(collection, key)
		if err != nil {
			return shim.Error(fmt.Sprintf("get operation on private data failed. Error accessing state: %s", err))
		}
		jsonVal, err := json.Marshal(string(value))
		return shim.Success(jsonVal)

	case "keysPrivate":
		if len(args) < 3 {
			return shim.Error("range query operation on private data must include three arguments, a collection, key and value")
		}
		collection := args[0]
		startKey := args[1]
		endKey := args[2]

		//sleep needed to test peer's timeout behavior when using iterators
		stime := 0
		if len(args) > 3 {
			stime, _ = strconv.Atoi(args[3])
		}

		keysIter, err := stub.GetPrivateDataByRange(collection, startKey, endKey)
		if err != nil {
			return shim.Error(fmt.Sprintf("keys operation failed on private data. Error accessing state: %s", err))
		}
		defer keysIter.Close()

		var keys []string
		for keysIter.HasNext() {
			//if sleeptime is specied, take a nap
			if stime > 0 {
				time.Sleep(time.Duration(stime) * time.Millisecond)
			}

			response, iterErr := keysIter.Next()
			if iterErr != nil {
				return shim.Error(fmt.Sprintf("keys operation on private data failed. Error accessing state: %s", err))
			}
			keys = append(keys, response.Key)
		}

		for key, value := range keys {
			fmt.Printf("key %d contains %s\n", key, value)
		}

		jsonKeys, err := json.Marshal(keys)
		if err != nil {
			return shim.Error(fmt.Sprintf("keys operation on private data failed. Error marshaling JSON: %s", err))
		}

		return shim.Success(jsonKeys)

	case "queryPrivate":
		collection := args[0]
		query := args[1]
		keysIter, err := stub.GetPrivateDataQueryResult(collection, query)
		if err != nil {
			return shim.Error(fmt.Sprintf("query operation on private data failed. Error accessing state: %s", err))
		}
		defer keysIter.Close()

		var keys []string
		for keysIter.HasNext() {
			response, iterErr := keysIter.Next()
			if iterErr != nil {
				return shim.Error(fmt.Sprintf("query operation on private data failed. Error accessing state: %s", err))
			}
			keys = append(keys, response.Key)
		}

		jsonKeys, err := json.Marshal(keys)
		if err != nil {
			return shim.Error(fmt.Sprintf("query operation on private data failed. Error marshaling JSON: %s", err))
		}

		return shim.Success(jsonKeys)

	case "put":
		if len(args)%2 != 0 {
			return shim.Error("put operation must include an even number of key/value pair arguments: [key, value]")
		}
		fmt.Println("In mapkeys put")
                for index, element := range args {
                        if index%2 == 0 {
                                key := element
                                value := args[index+1]
                                fmt.Println("Saved {%s,%s}", key, value)

                                if err := stub.PutState(key, []byte(value)); err != nil {
                                        fmt.Printf("Error putting state %s", err)
                                        return shim.Error(fmt.Sprintf("put operation failed. Error updating state: %s", err))
                                }
			}
		}

		return shim.Success(nil)

	case "remove":
		if len(args) < 1 {
			return shim.Error("remove operation must include one argument: [key]")
		}
		key := args[0]

		err := stub.DelState(key)
		if err != nil {
			return shim.Error(fmt.Sprintf("remove operation failed. Error updating state: %s", err))
		}
		return shim.Success(nil)

	case "get":
		if len(args) < 1 {
			return shim.Error("get operation must include one argument, a key")
		}
		key := args[0]
		value, err := stub.GetState(key)
		if err != nil {
			return shim.Error(fmt.Sprintf("get operation failed. Error accessing state: %s", err))
		}
		jsonVal, err := json.Marshal(string(value))
		return shim.Success(jsonVal)

	case "keys":
		if len(args) < 2 {
			return shim.Error("put operation must include two arguments, a key and value")
		}
		startKey := args[0]
		endKey := args[1]

		//sleep needed to test peer's timeout behavior when using iterators
		stime := 0
		if len(args) > 2 {
			stime, _ = strconv.Atoi(args[2])
		}

		keysIter, err := stub.GetStateByRange(startKey, endKey)
		if err != nil {
			return shim.Error(fmt.Sprintf("keys operation failed. Error accessing state: %s", err))
		}
		defer keysIter.Close()

		var keys []string
		for keysIter.HasNext() {
			//if sleeptime is specied, take a nap
			if stime > 0 {
				time.Sleep(time.Duration(stime) * time.Millisecond)
			}

			response, iterErr := keysIter.Next()
			if iterErr != nil {
				return shim.Error(fmt.Sprintf("keys operation failed. Error accessing state: %s", err))
			}
			keys = append(keys, response.Key)
		}

		for key, value := range keys {
			fmt.Printf("key %d contains %s\n", key, value)
		}

		jsonKeys, err := json.Marshal(keys)
		if err != nil {
			return shim.Error(fmt.Sprintf("keys operation failed. Error marshaling JSON: %s", err))
		}

		return shim.Success(jsonKeys)
	case "query":
		query := args[0]
		keysIter, err := stub.GetQueryResult(query)
		if err != nil {
			return shim.Error(fmt.Sprintf("query operation failed. Error accessing state: %s", err))
		}
		defer keysIter.Close()

		var keys []string
		for keysIter.HasNext() {
			response, iterErr := keysIter.Next()
			if iterErr != nil {
				return shim.Error(fmt.Sprintf("query operation failed. Error accessing state: %s", err))
			}
			keys = append(keys, response.Key)
		}

		jsonKeys, err := json.Marshal(keys)
		if err != nil {
			return shim.Error(fmt.Sprintf("query operation failed. Error marshaling JSON: %s", err))
		}

		return shim.Success(jsonKeys)
	case "history":
		key := args[0]
		keysIter, err := stub.GetHistoryForKey(key)
		if err != nil {
			return shim.Error(fmt.Sprintf("query operation failed. Error accessing state: %s", err))
		}
		defer keysIter.Close()

		var keys []string
		for keysIter.HasNext() {
			response, iterErr := keysIter.Next()
			if iterErr != nil {
				return shim.Error(fmt.Sprintf("query operation failed. Error accessing state: %s", err))
			}
			keys = append(keys, response.TxId)
		}

		for key, txID := range keys {
			fmt.Printf("key %d contains %s\n", key, txID)
		}

		jsonKeys, err := json.Marshal(keys)
		if err != nil {
			return shim.Error(fmt.Sprintf("query operation failed. Error marshaling JSON: %s", err))
		}

		return shim.Success(jsonKeys)

	default:
		return shim.Success([]byte("Unsupported operation"))
	}
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting chaincode: %s", err)
	}
}
