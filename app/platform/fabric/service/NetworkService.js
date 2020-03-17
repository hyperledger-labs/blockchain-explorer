/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const helper = require('../../../common/helper');

const logger = helper.getLogger('NetworkService');

/**
 *
 *
 * @class NetworkService
 */
class NetworkService {
	/**
	 * Creates an instance of NetworkService.
	 * @param {*} platform
	 * @memberof NetworkService
	 */
	constructor(platform) {
		this.platform = platform;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof NetworkService
	 */
	async networkList() {
		// Get the list of the networks from the  configuration that was loaded from the config.json
		const networklist = [];
		const networks = this.platform.getNetworks();
		logger.debug('Network list ', networks);
		for (const [networkName, clientObj] of networks.entries()) {
			logger.debug('Network list ', networkName);
			networklist.push({
				name: networkName,
				authEnabled: clientObj.instance.fabricGateway.getEnableAuthentication()
			});
		}

		logger.debug('Network list ', networklist);
		return networklist;
	}
}

module.exports = NetworkService;
