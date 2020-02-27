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
		for (const [networkName, network] of networks.entries()) {
			for (const [, client] of network.entries()) {
				networklist.push({
					name: networkName,
					authEnabled: client.fabricGateway.getEnableAuthentication()
				});
			}
		}

		logger.log('Network list ', networklist);
		return networklist;
	}
}

module.exports = NetworkService;
