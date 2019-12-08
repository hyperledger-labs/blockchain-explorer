#!/bin/bash -e

WD=$GOPATH/src/github.com/hyperledger/fabric-test/feature/sdk/java
cd $WD

echo "======== Build Java SDK wrapper ======"
mvn package
cp target/peer-javasdk-test-jar-with-dependencies-exclude-resources.jar peer-javasdk.jar
echo "jar file located in $WD ======"
