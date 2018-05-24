/*
    SPDX-License-Identifier: Apache-2.0
*/

/**
 *
 * Created by Cam Mach on 6/8/17.
 *
 */

var fs = require('fs');
var helper = require('../helper.js');
var logger = helper.getLogger('createFabChannel');
var hfc = require('fabric-client');
var networkService = require('./networkservice.js');

var createFabChannel = async function (channelName, channelConfigPath, orgName, orgPath, networkCfgPath) {
	logger.debug('createFabChannel ', channelName, channelConfigPath, orgName, orgPath, networkCfgPath)
	try {
		var client = await networkService.getClientForOrg(orgName, orgPath, networkCfgPath);
		// read in the envelope for the channel config raw bytes
		var envelope = fs.readFileSync(channelConfigPath);
		var channelConfig = client.extractChannelConfig(envelope);
		let signature = client.signChannelConfig(channelConfig);
		let request = {
			config: channelConfig,
			signatures: [signature],
			name: channelName,
			txId: client.newTransactionID(true)
		};

		var response = await client.createChannel(request);

		if (response && response.status === 'SUCCESS') {
			logger.info('Successfully created the channel.');
			let response = {
				success: true,
				message: 'Successfully created ' + channelName
			};

			return response;
		} else {
			logger.error('Failed to create the channel ' + channelName , response);
			throw new Error('Failed to create the channel ' + channelName , response);
		}

	} catch (err) {
		logger.error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
		throw new Error('Failed to initialize the channel: ' + err);

	}
};

exports.createFabChannel = createFabChannel;