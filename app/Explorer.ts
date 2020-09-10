/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const Express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const compression = require('compression');
const passport = require('passport');
const RateLimit = require('express-rate-limit');
import {PlatformBuilder } from './platform/PlatformBuilder';
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

	app = Express();
	persistence : any;
	platforms : any[];

	/**
	 * Creates an instance of Explorer.
	 * @memberof Explorer
	 */
	constructor() {

		// set up rate limiter: maximum of 1000 requests per minute

		const limiter = new RateLimit({
			windowMs: 1 * 60 * 1000, // 1 minute
			max: 1000
		});
		// apply rate limiter to all requests
		this.app.use(limiter);

		this.app.use(bodyParser.json());
		this.app.use(
			bodyParser.urlencoded({
				extended: true
			})
		);

		// eslint-disable-next-line spellcheck/spell-checker
		// handle rate limit, see https://lgtm.com/rules/1506065727959/

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

			// Initializing the platform
			await platform.initialize();

			// Make sure that platform instance will be referred after its initialization
			passport.use('local-login', localLoginStrategy(platform));

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
