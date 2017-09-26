docker pull gcc2ge/fabric-ca:latest
docker pull gcc2ge/fabric-tools:latest
docker pull gcc2ge/fabric-couchdb:latest
docker pull gcc2ge/fabric-kafka:latest
docker pull gcc2ge/fabric-zookeeper:latest
docker pull gcc2ge/fabric-testenv:latest
docker pull gcc2ge/fabric-buildenv:latest
docker pull gcc2ge/fabric-orderer:latest
docker pull gcc2ge/fabric-peer:latest
docker pull gcc2ge/fabric-javaenv:latest
docker pull gcc2ge/fabric-ccenv:latest
docker pull gcc2ge/fabric-baseimage:x86_64-0.3.1
docker pull gcc2ge/fabric-baseos:x86_64-0.3.1


docker tag gcc2ge/fabric-ca:latest               hyperledger/fabric-ca
docker tag gcc2ge/fabric-ca:latest               hyperledger/fabric-ca:x86_64-1.0.0-rc1-snapshot-1424b33
docker tag gcc2ge/fabric-tools:latest            hyperledger/fabric-tools
docker tag gcc2ge/fabric-tools:latest            hyperledger/fabric-tools:x86_64-1.0.0-rc1-snapshot-88b5bcb
docker tag gcc2ge/fabric-couchdb:latest          hyperledger/fabric-couchdb
docker tag gcc2ge/fabric-couchdb:latest          hyperledger/fabric-couchdb:x86_64-1.0.0-rc1-snapshot-88b5bcb
docker tag gcc2ge/fabric-kafka:latest            hyperledger/fabric-kafka
docker tag gcc2ge/fabric-kafka:latest            hyperledger/fabric-kafka:x86_64-1.0.0-rc1-snapshot-88b5bcb
docker tag gcc2ge/fabric-zookeeper:latest        hyperledger/fabric-zookeeper
docker tag gcc2ge/fabric-zookeeper:latest        hyperledger/fabric-zookeeper:x86_64-1.0.0-rc1-snapshot-88b5bcb
docker tag gcc2ge/fabric-testenv:latest          hyperledger/fabric-testenv
docker tag gcc2ge/fabric-testenv:latest          hyperledger/fabric-testenv:x86_64-1.0.0-rc1-snapshot-88b5bcb
docker tag gcc2ge/fabric-buildenv:latest         hyperledger/fabric-buildenv
docker tag gcc2ge/fabric-buildenv:latest         hyperledger/fabric-buildenv:x86_64-1.0.0-rc1-snapshot-88b5bcb
docker tag gcc2ge/fabric-orderer:latest          hyperledger/fabric-orderer
docker tag gcc2ge/fabric-orderer:latest          hyperledger/fabric-orderer:x86_64-1.0.0-rc1-snapshot-88b5bcb
docker tag gcc2ge/fabric-peer:latest             hyperledger/fabric-peer
docker tag gcc2ge/fabric-peer:latest             hyperledger/fabric-peer:x86_64-1.0.0-rc1-snapshot-88b5bcb
docker tag gcc2ge/fabric-javaenv:latest          hyperledger/fabric-javaenv
docker tag gcc2ge/fabric-javaenv:latest          hyperledger/fabric-javaenv:x86_64-1.0.0-rc1-snapshot-88b5bcb
docker tag gcc2ge/fabric-ccenv:latest            hyperledger/fabric-ccenv
docker tag gcc2ge/fabric-ccenv:latest            hyperledger/fabric-ccenv:x86_64-1.0.0-rc1-snapshot-88b5bcb
docker tag gcc2ge/fabric-baseimage:x86_64-0.3.1  hyperledger/fabric-baseimage:x86_64-0.3.1
docker tag gcc2ge/fabric-baseos:x86_64-0.3.1     hyperledger/fabric-baseos:x86_64-0.3.1

