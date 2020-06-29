/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const requtil = require('./requestutils');

/**
 *
 *
 * @param {*} router
 * @param {*} platform
 */
const platformroutes = async function(router, platform) {
	const proxy = platform.getProxy();

	/**
	 * Transactions by Organization(s)
	 * GET /txByOrg
	 * curl -i 'http://<host>:<port>/txByOrg/<channel_genesis_hash>'
	 * Response:
	 * {'rows':[{'count':'4','creator_msp_id':'Org1'}]}
	 */
	router.get('/txByOrg/:channel_genesis_hash', (req, res) => {
		const channel_genesis_hash = req.params.channel_genesis_hash;

		if (channel_genesis_hash) {
			proxy
				.getTxByOrgs(req.network, channel_genesis_hash)
				.then(rows => res.send({ status: 200, rows }));
		} else {
			return requtil.invalidRequest(req, res);
		}
	});

	/**
	 * Channels
	 * GET /channels -> /channels/info
	 * curl -i 'http://<host>:<port>/channels/<info>'
	 * Response:
	 * [
	 * {
	 * 'channelName': 'mychannel',
	 * 'channel_hash': '',
	 * 'craetedat': '1/1/2018'
	 * }
	 * ]
	 */
	router.get('/channels/info', (req, res) => {
		proxy
			.getChannelsInfo(req.network)
			.then(data => {
				data.forEach(element => {
					element.createdat = new Date(element.createdat).toISOString();
				});
				res.send({ status: 200, channels: data });
			})
			.catch(err => res.send({ status: 500, error: err }));
	});

	/**
	 * *Peer Status List
	 * GET /peerlist -> /peersStatus
	 * curl -i 'http://<host>:<port>/peersStatus/<channel>'
	 * Response:
	 * [
	 * {
	 * 'requests': 'grpcs://127.0.0.1:7051',
	 * 'server_hostname': 'peer0.org1.example.com'
	 * }
	 * ]
	 */
	router.get('/peersStatus/:channel', (req, res) => {
		const channelName = req.params.channel;
		if (channelName) {
			proxy.getPeersStatus(req.network, channelName).then(data => {
				res.send({ status: 200, peers: data });
			});
		} else {
			return requtil.invalidRequest(req, res);
		}
	});

	/**
	 * *
	 * Block by number
	 * GET /block/getinfo -> /block
	 * curl -i 'http://<host>:<port>/block/<channel>/<number>'
	 */
	router.get('/block/:channel_genesis_hash/:number', (req, res) => {
		const number = parseInt(req.params.number);
		const channel_genesis_hash = req.params.channel_genesis_hash;
		if (!isNaN(number) && channel_genesis_hash) {
			proxy
				.getBlockByNumber(req.network, channel_genesis_hash, number)
				.then(block => {
					if (typeof block === 'string') {
						res.send({ status: 500, error: block });
					} else {
						res.send({
							status: 200,
							number: block.header.number.toString(),
							previous_hash: block.header.previous_hash.toString('hex'),
							data_hash: block.header.data_hash.toString('hex'),
							transactions: block.data.data
						});
					}
				});
		} else {
			return requtil.invalidRequest(req, res);
		}
	});

	/**
	 * Return list of channels
	 * GET /channellist -> /channels
	 * curl -i http://<host>:<port>/channels
	 * Response:
	 * {
	 * 'channels': [
	 * {
	 * 'channel_id': 'mychannel'
	 * }
	 * ]
	 * }
	 */
	router.get('/channels', (req, res) => {
		proxy.getChannels(req.network).then(channels => {
			const response = {
				status: 200
			};
			response.channels = channels;
			res.send(response);
		});
	});

	/**
	 * Return current channel
	 * GET /curChannel
	 * curl -i 'http://<host>:<port>/curChannel'
	 */
	router.get('/curChannel', (req, res) => {
		proxy.getCurrentChannel(req.network).then(data => {
			res.send(data);
		});
	});

	/**
	 * Return change channel
	 * POST /changeChannel
	 * curl -i 'http://<host>:<port>/curChannel'
	 */
	router.get('/changeChannel/:channel_genesis_hash', (req, res) => {
		const channel_genesis_hash = req.params.channel_genesis_hash;
		proxy.changeChannel(req.network, channel_genesis_hash).then(data => {
			res.send({
				currentChannel: data
			});
		});
	});
}; // End platformroutes()

module.exports = platformroutes;
