
/*
    SPDX-License-Identifier: Apache-2.0
*/

/* //TODO, needs to be moved to a network connection class, after the implementation
and loading of the .yaml config file*/

var hfc = require('fabric-client');
var helper = require('../helper.js');
var logger = helper.getLogger('networkservice');

async function getClientForOrg(userorg, orgPath, networkCfgPath) {
    logger.log('getClientForOrg ', userorg, orgPath, networkCfgPath)
    let config = '-connection-profile-path';
    hfc.setConfigSetting('network' + config, networkCfgPath);
    hfc.setConfigSetting(userorg + config, orgPath);
    let client = hfc.loadFromConfig(hfc.getConfigSetting('network' + config));
    client.loadFromConfig(hfc.getConfigSetting(userorg + config));
    await client.initCredentialStores();

    return client;
}

exports.getClientForOrg = getClientForOrg;