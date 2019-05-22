#!/bin/bash

# SPDX-License-Identifier: Apache-2.0


# Prerequisition:
# - Install Hyperledger Fabric container images and tools (by running fabric-samples/scripts/bootstrap.sh)
#   You also need to add these tool location to PATH
# - Install python, pip and virtualenv

npm install
npm run e2e-test