/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const passport = require('passport');

const { responder } = require('./requestutils');
const helper = require('../common/helper');

const logger = helper.getLogger('Auth');

/**
 *
 *
 * @param {*} router
 * @param {*} platform
 */
const authroutes = async function(router, platform) {
	const proxy = platform.getProxy();

	/**
	 * *
	 * Network list
	 * GET /networklist -> /login
	 * curl -i 'http://<host>:<port>/networklist'
	 */

	router.get(
		'/networklist',
		responder(async req => {
			const networkList = await proxy.networkList(req);
			return { networkList };
		})
	);

	/**
	 * *
	 * Login
	 * POST /login -> /login
	 * curl -X POST -H 'Content-Type: routerlication/json' -d '{ 'user': '<user>', 'password': '<password>', 'network': '<network>' }' -i 'http://<host>:<port>/login'
	 */
	router.post('/login', async (req, res, next) => {
		logger.debug('req.body', req.body);
		return passport.authenticate('local-login', (err, token, userData) => {
			if (err) {
				if (err.name === 'IncorrectCredentialsError') {
					return res.status(400).json({
						success: false,
						message: err.message
					});
				}
				return res.status(400).json({
					success: false,
					message: 'Could not process the form.'
				});
			}
			return res.status(200).json({
				success: true,
				message: 'You have successfully logged in!',
				token,
				user: userData
			});
		})(req, res, next);
	});

	router.post('/logout', async (req, res) => {
		logger.debug('req.body', req.body);
		req.logout();
		res.send();
	});
};

module.exports = authroutes;
