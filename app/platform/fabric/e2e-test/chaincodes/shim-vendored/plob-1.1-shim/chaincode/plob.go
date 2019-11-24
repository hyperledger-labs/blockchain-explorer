/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package main

import (
	"bytes"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"

	"github.com/golang/protobuf/proto"
)

// Define the Smart Contract structure
type PermissionedBlobRegistry struct{}

// Init is called when the chaincode is instantiatied, for now, a no-op
func (s *PermissionedBlobRegistry) Init(stub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

// Invoke allows for the manipulation of blobs, either creation or modification
func (s *PermissionedBlobRegistry) Invoke(stub shim.ChaincodeStubInterface) sc.Response {

	args := stub.GetArgs()

	if len(args) == 0 {
		return shim.Error("Invoke called with no arguments")
	}

	// Route to the appropriate handler function to interact with the ledger appropriately
	switch string(args[0]) {
	case "query":
		return s.queryBlob(stub, args[1:])
	case "set":
		return s.setBlob(stub, args[1:])
	case "delete":
		return s.deleteBlob(stub, args[1:])
	default:
		return shim.Error("Invalid invocation function")
	}
}

// setBlob expects 2 args, id and blob
func (s *PermissionedBlobRegistry) setBlob(stub shim.ChaincodeStubInterface, args [][]byte) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	key := string(args[0])

	creator, err := stub.GetCreator()
	if err != nil {
		return shim.Error(fmt.Sprintf("Could not get creator: %s", err))
	}

	valueBytes, err := stub.GetState(key)
	if err != nil {
		return shim.Error(fmt.Sprintf("Could not get state for key %s: %s", key, err))
	}

	// If the key already exists, make sure this user is the owner of that key before allowing a write
	if valueBytes != nil {
		plob := &PermissionedBlob{}
		err = proto.Unmarshal(valueBytes, plob)
		if err != nil {
			return shim.Error(fmt.Sprintf("Unexpected error unmarshaling: %s", err))
		}

		if !bytes.Equal(plob.Owner, creator) {
			return shim.Error(fmt.Sprintf("Not authorized to modify key %s", key))
		}
	}

	plob := &PermissionedBlob{
		Owner: creator,
		Blob:  args[1],
	}

	asBytes, err := proto.Marshal(plob)
	if err != nil {
		return shim.Error(fmt.Sprintf("Unexpected error marshaling: %s", err))
	}

	err = stub.PutState(key, asBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Could not put state for key %s: %s", key, err))
	}

	return shim.Success(nil)
}

// queryBlob expects 1 arg, the blob's key
func (s *PermissionedBlobRegistry) queryBlob(stub shim.ChaincodeStubInterface, args [][]byte) sc.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	key := string(args[0])

	plobBytes, err := stub.GetState(key)
	if err != nil {
		return shim.Error(fmt.Sprintf("Could not get state for key %s: %s", key, err))
	}

	plob := &PermissionedBlob{}
	err = proto.Unmarshal(plobBytes, plob)
	if err != nil {
		return shim.Error(fmt.Sprintf("Unexpected error unmarshaling: %s", err))
	}

	// No need to check permission, anyone who can read the blockchain can also read all the blobs

	return shim.Success(plob.Blob)
}

// deleteBlob expects 1 arg, the blob's key
func (s *PermissionedBlobRegistry) deleteBlob(stub shim.ChaincodeStubInterface, args [][]byte) sc.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	creator, err := stub.GetCreator()
	if err != nil {
		return shim.Error(fmt.Sprintf("Could not get creator: %s", err))
	}

	key := string(args[0])

	plobBytes, err := stub.GetState(key)
	if err != nil {
		return shim.Error(fmt.Sprintf("Could not get state for key %s: %s", key, err))
	}

	if plobBytes == nil {
		return shim.Error(fmt.Sprintf("Key %s did not already exist", key))
	}

	plob := &PermissionedBlob{}
	err = proto.Unmarshal(plobBytes, plob)
	if err != nil {
		shim.Error(fmt.Sprintf("Unexpected error unmarshaling: %s", err))
	}

	// Make sure the requestor is the owner
	if !bytes.Equal(plob.Owner, creator) {
		return shim.Error(fmt.Sprintf("Not authorized to modify key %s", key))
	}

	err = stub.DelState(key)
	if err != nil {
		return shim.Error(fmt.Sprintf("Error deleting state for key %s", key))
	}

	return shim.Success(nil)
}

// main function starts up the chaincode in the container during instantiate
func main() {
	if err := shim.Start(new(PermissionedBlobRegistry)); err != nil {
		fmt.Printf("Error starting PermissionedBlobRegistry chaincode: %s", err)
	}
}
