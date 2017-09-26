#!/bin/bash -eu
# Copyright London Stock Exchange Group All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#
# This script pulls docker images from the Dockerhub hyperledger repositories

# set the default Docker namespace and tag
DOCKER_NS=hyperledger
ARCH=s390x
VERSION=1.0.0-rc1
BASE_DOCKER_TAG=x86_64-0.3.1

# set of Hyperledger Fabric images
FABRIC_IMAGES=(fabric-peer fabric-orderer fabric-ccenv fabric-javaenv fabric-kafka fabric-zookeeper \
fabric-couchdb fabric-tools)

for image in ${FABRIC_IMAGES[@]}; do
  echo "Pulling ${DOCKER_NS}/$image:${ARCH}-${VERSION}"
  docker pull ${DOCKER_NS}/$image:${ARCH}-${VERSION}
done

echo "Pulling ${DOCKER_NS}/fabric-baseos:${BASE_DOCKER_TAG}"
docker pull ${DOCKER_NS}/fabric-baseos:${BASE_DOCKER_TAG}
