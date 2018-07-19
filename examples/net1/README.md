# Hyperledger Explorer Configuration

This folder contains the configuration settings of Hyperledger explorer.

The differences between standard deployment and dockerized deployment is that:

* Crypto material is saved under **/tmp/crypto**

As consequence, it needs to be references always as, see the example below:

```json
"admin": {
	"key": "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore",
	"cert": "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts"
}
```
