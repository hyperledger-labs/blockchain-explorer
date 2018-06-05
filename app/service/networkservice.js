
/*
    SPDX-License-Identifier: Apache-2.0
*/

var hfc = require('fabric-client');
var helper = require('../helper.js');
var logger = helper.getLogger('networkservice');
var path = require('path');

async function getClientForOrg(userorg, orgPath, networkCfgPath) {
    let config = '-connection-profile-path';
    let networkConfig = 'network' + config;
    hfc.setConfigSetting(networkConfig, networkCfgPath);
    hfc.setConfigSetting(userorg + config, orgPath);
    let client = hfc.loadFromConfig(hfc.getConfigSetting(networkConfig));
    try {
        client.loadFromConfig(hfc.getConfigSetting(userorg + config));
        await client.initCredentialStores();
    } catch (err) {
        logger.error("getClientForOrg " + err.stack ? err.stack : err)
    }
    return client;
}

exports.getClientForOrg = getClientForOrg;