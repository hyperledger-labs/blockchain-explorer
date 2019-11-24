/*
Copyright IBM Corp. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"encoding/json"
	"sort"
	"testing"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/stretchr/testify/assert"
)

func TestDispatch(t *testing.T) {
	cc := new(EndorsementCC)
	stub := shim.NewMockStub("ecc", cc)

	res := stub.MockInvoke("1", [][]byte{[]byte("unknown")})
	assert.Equal(t, int32(shim.ERROR), res.Status)
}

func TestCreateRecord(t *testing.T) {
	cc := new(EndorsementCC)
	stub := shim.NewMockStub("ecc", cc)

	// create the record and set its value
	res := stub.MockInvoke("1", [][]byte{[]byte("updateRecordVal"), []byte("foo"), []byte("bar")})
	assert.Equal(t, int32(shim.OK), res.Status)

	// retrieve the record
	res = stub.MockInvoke("2", [][]byte{[]byte("getRecord"), []byte("foo")})
	assert.Equal(t, int32(shim.OK), res.Status)

	// verify record
	var record Record
	err := json.Unmarshal(res.Payload, &record)
	assert.NoError(t, err)
	assert.Equal(t, []byte("bar"), record.Value)
}

func TestCreateRecordWithEP(t *testing.T) {
	cc := new(EndorsementCC)
	stub := shim.NewMockStub("ecc", cc)

	// create the record and set its value
	res := stub.MockInvoke("1", [][]byte{[]byte("updateRecordVal"), []byte("foo"), []byte("bar")})
	assert.Equal(t, int32(shim.OK), res.Status)

	// set the record's ep
	res = stub.MockInvoke("2", [][]byte{[]byte("updateRecordEP"), []byte("foo"), []byte("org1"), []byte("org2")})
	assert.Equal(t, int32(shim.OK), res.Status)

	// retrieve the record
	res = stub.MockInvoke("3", [][]byte{[]byte("getRecord"), []byte("foo")})
	assert.Equal(t, int32(shim.OK), res.Status)

	// verify record
	var record Record
	err := json.Unmarshal(res.Payload, &record)
	assert.NoError(t, err)
	assert.Equal(t, []byte("bar"), record.Value)
	sort.Strings(record.Orgs)
	assert.Equal(t, []string{"org1", "org2"}, record.Orgs)
}
