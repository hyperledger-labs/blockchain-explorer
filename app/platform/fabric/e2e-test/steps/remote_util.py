#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

import os
import sys
import yaml
import json

from request_util import httpGet, httpPost, getAttributeFromJSON, JSON_HEADER


def getNetworkDetails(context):
    """ Get the network details from the network yaml or json file"""
    if hasattr(context, "network"):
        fd = open(context.network, "r")
        try:
            if context.network.endswith(("yaml", "yml")):
                context.networkInfo = yaml.load(fd)
            elif context.network.endswith("json"):
                context.networkInfo = json.load(fd)
        except:
            print("Unable to load the network configuration file: {0}".format(sys.exc_info()[0]) )
            context.networkInfo = json.load(fd)
    return context


def getHeaders(context):
    headers = context.networkInfo["headers"].copy()
    return headers


def getNetworkID(context):
    """ Get the Network ID."""
    if hasattr(context, 'networkInfo'):
        return context.networkInfo["networkID"]


def stopNode(context, peer):
    """Stops the peer node on a specific network."""
    nodeId = context.networkInfo["nodes"][peer]["nodeID"]
    url = context.networkInfo["urls"]["stopURL"].format(IPaddress=context.networkInfo["IPaddress"],
                                                        port=context.networkInfo["port"],
                                                        networkID=context.networkInfo["networkID"],
                                                        nodeID=nodeId)
    body = {}
    response = httpPost(url, body, headers=getHeaders(context))


def startNode(context, peer):
    """Start the peer node on a specific network."""
    nodeId = context.networkInfo["nodes"][peer]["nodeID"]
    url = context.networkInfo["urls"]["startURL"].format(IPaddress=context.networkInfo["IPaddress"],
                                                         port=context.networkInfo["port"],
                                                         networkID=context.networkInfo["networkID"],
                                                         nodeID=nodeId)
    body = {}
    response = httpPost(url, body, headers=getHeaders(context))


def restartNode(context, peer):
    """Restart the peer node on a specific network."""
    nodeId = context.networkInfo["nodes"][peer]["nodeID"]
    url = context.networkInfo["urls"]["restartURL"].format(IPaddress=context.networkInfo["IPaddress"],
                                                           port=context.networkInfo["port"],
                                                           networkID=context.networkInfo["networkID"],
                                                           nodeID=nodeId)
    body = {}
    response = httpPost(url, body, headers=getHeaders(context))


def getNodeStatus(context, peer):
    """Get the Node status."""
    nodeId = context.networkInfo["nodes"][peer]["nodeID"]
    body = {"nodes": [nodeId]}
    url = context.networkInfo["urls"]["statusURL"].format(IPaddress=context.networkInfo["IPaddress"],
                                                          port=context.networkInfo["port"],
                                                          networkID=context.networkInfo["networkID"])
    response = httpPost(url, body, headers=getHeaders(context))
    return response


def getNodeLogs(context, component):
    """ Get the Node logs."""
    nodeId = context.networkInfo["nodes"][component]["nodeID"]
    url = context.networkInfo["urls"]["getLogsURL"].format(IPaddress=context.networkInfo["IPaddress"],
                                                           port=context.networkInfo["port"],
                                                           nodeID=nodeId,
                                                           networkID=context.networkInfo["networkID"])
    response = httpGet(url, headers=getHeaders(context))
    return response


def getChaincodeStatus(context, peer):
    """ Get the Node status."""
    nodeId = context.networkInfo["nodes"][peer]["nodeID"]
    url = context.networkInfo["urls"]["ccStatusURL"].format(IPaddress=context.networkInfo["IPaddress"],
                                                            port=context.networkInfo["port"],
                                                            peer=nodeId,
                                                            networkID=context.networkInfo["networkID"])
    response = httpGet(url, headers=getHeaders(context))
    return response


def getChaincodeLogs(context, peer, channelID):
    """ Get the Chaincode logs."""
    nodeId = context.networkInfo["nodes"][peer]["nodeID"]
    if hasattr(context, 'chaincodeSpec'):
        url = context.networkInfo["urls"]["getCCLogsURL"].format(IPaddress=context.networkInfo["IPaddress"],
                                                                 port=context.networkInfo["port"],
                                                                 nodeID=nodeId,
                                                                 ccID=nodeId,
                                                                 networkID=context.networkInfo["networkID"])
        response = httpGet(url, headers=getHeaders(context))
    else:
        response = "No chaincode has been deployed"
    return response
