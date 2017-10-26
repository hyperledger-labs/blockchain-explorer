#!/bin/bash -eu
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This script downloads the build your first network sample app 

# set the default Docker namespace and tag
VERSION=1.0.4-snapshot-52261887
echo "===> Downloading Build Your First Network sample application"
curl https://nexus.hyperledger.org/content/repositories/releases/org/hyperledger/fabric/examples/hyperledger-fabric-byfn-$(VERSION).tar.gz | tar xz
