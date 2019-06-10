/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const Express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const compression = require('compression');
const passport = require('passport');
const PlatformBuilder = require('./platform/PlatformBuilder');
const explorerconfig = require('./explorerconfig.json');
const PersistenceFactory = require('./persistence/PersistenceFactory');
const ExplorerError = require('./common/ExplorerError');

const localLoginStrategy = require('./passport/local-login');
const authroutes = require('./rest/authroutes');
const dbroutes = require('./rest/dbroutes');
const platformroutes = require('./rest/platformroutes');
const adminroutes = require('./platform/fabric/rest/adminroutes');

const authCheckMiddleware = require('./middleware/auth-check');

const swaggerDocument = require('../swagger.json');

const explorer_const = require('./common/ExplorerConst').explorer.const;
const explorer_error = require('./common/ExplorerMessage').explorer.error;

/**
 *
 *
 * @class Explorer
 */
class Explorer {
	/**
	 * Creates an instance of Explorer.
	 * @memberof Explorer
	 */
	constructor() {
		this.app = new Express();
		this.app.use(bodyParser.json());
		this.app.use(
			bodyParser.urlencoded({
				extended: true
			})
		);
		this.app.use(passport.initialize());
		if (process.env.NODE_ENV !== 'production') {
			this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
		}
		this.app.use(compression());
		this.persistence = null;
		this.platforms = [];
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Explorer
	 */
	getApp() {
		return this.app;
	}

	/**
	 *
	 *
	 * @param {*} broadcaster
	 * @memberof Explorer
	 */
	async initialize(broadcaster) {
		if (!explorerconfig[explorer_const.PERSISTENCE]) {
			throw new ExplorerError(explorer_error.ERROR_1001);
		}
		if (!explorerconfig[explorerconfig[explorer_const.PERSISTENCE]]) {
			throw new ExplorerError(
				explorer_error.ERROR_1002,
				explorerconfig[explorer_const.PERSISTENCE]
			);
		}
		this.persistence = await PersistenceFactory.create(
			explorerconfig[explorer_const.PERSISTENCE],
			explorerconfig[explorerconfig[explorer_const.PERSISTENCE]]
		);

		for (const pltfrm of explorerconfig[explorer_const.PLATFORMS]) {
			const platform = await PlatformBuilder.build(
				pltfrm,
				this.persistence,
				broadcaster
			);

			platform.setPersistenceService();

			passport.use('local-login', localLoginStrategy(platform));

			// Initializing the platform
			await platform.initialize();

			this.app.use('/api', authCheckMiddleware);

			const authrouter = new Express.Router();

			// Initializing the rest app services
			await authroutes(authrouter, platform);

			const apirouter = new Express.Router();

			// Initializing the rest app services
			await dbroutes(apirouter, platform);
			await platformroutes(apirouter, platform);
			await adminroutes(apirouter, platform);

			this.app.use('/auth', authrouter);
			this.app.use('/api', apirouter);

			// Initializing sync listener
			platform.initializeListener(explorerconfig.sync);

			this.platforms.push(platform);
		}
	}

	/**
	 *
	 *
	 * @memberof Explorer
	 */

	close() {
		if (this.persistence) {
			this.persistence.closeconnection();
		}
		for (const platform of this.platforms) {
			if (platform) {
				platform.destroy();
			}
		}
	}
}

module.exports = Explorer;
