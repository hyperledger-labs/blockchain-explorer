#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

import requests, json

REST_PORT = "7050"
ACCEPT_JSON_HEADER = {'Accept': 'application/json'}
JSON_HEADER = {'Accept': 'application/json',
               'Content-type': 'application/json'}

def getAttributeFromJSON(attribute, json):
    foundJson = getHierarchyAttributesFromJSON(attribute.split("."), json)
    assert foundJson is not None, "Unable to locate {} in JSON".format(attribute)
    return foundJson

def getHierarchyAttributesFromJSON(attributes, json):
    foundJson = None
    currentAttribute = attributes[0]
    if currentAttribute in json:
        foundJson = json[currentAttribute]
        attributesToGo = attributes[1:]
        if len(attributesToGo) > 0:
            foundJson = getHierarchyAttributesFromJSON(attributesToGo, foundJson)
    return foundJson

def httpGet(url, headers=ACCEPT_JSON_HEADER, expectSuccess=True):
    return _request("GET", url, headers, expectSuccess=expectSuccess)

def httpPost(url, body, headers=ACCEPT_JSON_HEADER, expectSuccess=True):
    return _request("POST", url, headers=headers, expectSuccess=expectSuccess, json=body)

def _request(method, url, headers, expectSuccess=True, **kwargs):
    response = requests.request(method, url, headers=headers, verify=False, **kwargs)
    response.connection.close()
    if expectSuccess:
        assert response.status_code == 200, "Failed to {} to {}: {}".format(method, url, response.text)
    #print("Response from {}:".format(url))
    #print(formatResponseText(response))
    return response

def formatResponseText(response):
    try:
        return json.dumps(response.json(), indent = 4)[:300]
    except:
        return ""
